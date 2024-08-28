# Copyright © 2023-2024 ACCLS. All rights reserved.

import torch.nn as nn
import torch
from torch.nn import functional


class EdgeConv(nn.Module):
    def __init__(self,
                 channels,
                 rep_time,
                 use_sobel):
        super(EdgeConv, self).__init__()

        self.rep_time = rep_time
        self.use_sobel = use_sobel

        self.sobel_horizontal_kernel = torch.Tensor(
            [[
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ]] * channels).float().unsqueeze(0)
        self.sobel_vertical_kernel = torch.Tensor(
            [[
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ]] * channels).float().unsqueeze(0)

        self.inner_channels = channels // 3 if channels >= 2 else 1

        self.conv = nn.ModuleList([nn.Sequential(
            nn.Conv2d(channels, self.inner_channels, kernel_size=1, stride=1),
            nn.BatchNorm2d(self.inner_channels),
            nn.PReLU(),

            nn.Conv2d(self.inner_channels, channels, kernel_size=3, padding=1, stride=1),
            nn.BatchNorm2d(channels),
            nn.PReLU(),

            nn.Dropout2d(0.01)
        ) for _ in range(rep_time)])

    def edge_catch(self, x):
        return functional.conv2d(input=x,
                                 weight=self.sobel_horizontal_kernel,
                                 stride=1,
                                 padding=1) + \
            functional.conv2d(input=x,
                              weight=self.sobel_vertical_kernel,
                              stride=1,
                              padding=1)

    def forward(self, x):
        if x.is_cuda:
            self.sobel_horizontal_kernel = self.sobel_horizontal_kernel.cuda()
            self.sobel_vertical_kernel = self.sobel_vertical_kernel.cuda()

        res = torch.Tensor(x)

        for op in self.conv:
            if self.use_sobel:
                edge = self.edge_catch(res)
                res = op(res) + edge
            else:
                res = op(res) + res
        return res + x


class Packing(nn.Module):
    def __init__(self,
                 in_channels,
                 out_channels):
        super(Packing, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=1),
            nn.BatchNorm2d(out_channels),
            nn.PReLU(),

            nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.PReLU(),

            nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.PReLU(),

            nn.Dropout2d(0.01)
        )

        self.output = nn.Sequential(
            nn.Sigmoid()
        )

    def forward(self, x):
        x = self.conv(x)
        return self.output(x)


class DownSample(nn.Module):
    def __init__(self,
                 input_channels,
                 output_channels,
                 internal_ratio,
                 return_indices,
                 edge_rep_time):
        super(DownSample, self).__init__()

        self.inner_channels = int(input_channels * internal_ratio)

        self.return_indices = return_indices

        self.pool_line_p1 = nn.Sequential(
            nn.MaxPool2d(
                kernel_size=2,
                stride=2,
                return_indices=return_indices,
            ),
        )
        # pool_line_p2 is padding

        self.conv_line = nn.Sequential(
            # down sample
            nn.Conv2d(
                in_channels=input_channels,
                out_channels=self.inner_channels,
                kernel_size=2,
                stride=2,
            ),
            nn.BatchNorm2d(self.inner_channels),
            nn.PReLU(),

            # line main conv
            EdgeConv(self.inner_channels, edge_rep_time, use_sobel=True),

            # adjust dimension
            nn.Conv2d(
                in_channels=self.inner_channels,
                out_channels=output_channels,
                kernel_size=1,
                stride=1,
            ),
            nn.BatchNorm2d(output_channels),
            nn.PReLU(),
        )

        self.out_activation = nn.Sequential(
            EdgeConv(output_channels, edge_rep_time, use_sobel=False),
            nn.PReLU(),
        )

    def forward(self, input_data):
        conv_line_output = self.conv_line(input_data)
        b, c, h, w = conv_line_output.shape

        if self.return_indices:
            pool_line_output, need_indices = self.pool_line_p1(input_data)
        else:
            pool_line_output = self.pool_line_p1(input_data)
        # pool_line_p2
        need_to_padding_size = c - pool_line_output.shape[1]
        padding = torch.zeros(b, need_to_padding_size, h, w)
        if conv_line_output.is_cuda:
            padding = padding.cuda()
        pool_line_output = torch.cat((pool_line_output, padding), dim=1)

        next_out = self.out_activation(conv_line_output + pool_line_output)
        if self.return_indices:
            right_out = self.out_activation(pool_line_output)
            return next_out, right_out, need_indices
        else:
            return next_out


class UpSample(nn.Module):
    def __init__(self,
                 input_channels,
                 output_channels,
                 pool_channels,
                 internal_ratio,
                 edge_rep_time):
        super(UpSample, self).__init__()

        self.inner_channels = int(input_channels * internal_ratio)

        self.pool_line_p1 = nn.Sequential(
            nn.Conv2d(
                in_channels=input_channels,
                out_channels=pool_channels,
                kernel_size=1,
                stride=1,
            ),
            nn.BatchNorm2d(pool_channels),
            nn.PReLU(),
        )

        self.pool_line_p2 = nn.MaxUnpool2d(
            kernel_size=2,
        )

        self.pool_line_p3 = nn.Sequential(
            nn.Conv2d(
                in_channels=pool_channels,
                out_channels=output_channels,
                kernel_size=3,
                padding=1,
                stride=1,
            ),
            nn.BatchNorm2d(output_channels),
            nn.PReLU(),
        )

        self.conv_line = nn.Sequential(
            # adjust dimension
            nn.Conv2d(
                in_channels=input_channels,
                out_channels=self.inner_channels,
                kernel_size=1,
                stride=1,
            ),
            nn.BatchNorm2d(self.inner_channels),
            nn.PReLU(),

            # line main conv
            nn.ConvTranspose2d(
                in_channels=self.inner_channels,
                out_channels=self.inner_channels,
                kernel_size=2,
                stride=2,
            ),
            nn.BatchNorm2d(self.inner_channels),
            nn.PReLU(),

            # adjust dimension
            nn.Conv2d(
                in_channels=self.inner_channels,
                out_channels=output_channels,
                kernel_size=1,
                stride=1,
            ),
            nn.BatchNorm2d(output_channels),
            nn.PReLU(),
        )

        self.out = nn.Sequential(
            nn.PReLU(),
        )

    def forward(self, input_data_from_pre, input_data_from_left, pre_indices):
        # input_data = torch.cat((input_data_from_pre, input_data_from_left), dim=1)
        input_data = input_data_from_pre + input_data_from_left

        # input_data = self.input_adjust_dimension(input_data)

        conv_line_output = self.conv_line(input_data)

        pool_line_output = self.pool_line_p1(input_data_from_left)
        pool_line_output = self.pool_line_p2(pool_line_output, pre_indices)
        pool_line_output = self.pool_line_p3(pool_line_output)

        next_out = self.out(conv_line_output + pool_line_output)

        return next_out


class hNet(nn.Module):
    def __init__(self, num_classes, edge_rep_time=2):
        super(hNet, self).__init__()

        self.ripe_img_down_0 = DownSample(3, 16, 2, True, edge_rep_time)
        self.ripe_img_down_1 = DownSample(16, 64, 2, True, edge_rep_time)
        self.ripe_img_down_2 = DownSample(64, 256, 2, True, edge_rep_time)
        self.ripe_img_down_3 = DownSample(256, 1024, 2, True, edge_rep_time)

        self.raw_img_down_0 = DownSample(3, 16, 2, False, edge_rep_time)
        self.raw_img_down_1 = DownSample(16, 64, 2, False, edge_rep_time)
        self.raw_img_down_2 = DownSample(64, 256, 2, False, edge_rep_time)
        self.raw_img_down_3 = DownSample(256, 1024, 2, False, edge_rep_time)

        self.up_0 = UpSample(1024, 256, 256, 0.5, edge_rep_time)
        self.up_1 = UpSample(256, 64, 64, 0.5, edge_rep_time)
        self.up_2 = UpSample(64, 16, 16, 0.5, edge_rep_time)
        self.up_3 = UpSample(16, 3, 3, 4, edge_rep_time)

        self.pack = Packing(3, num_classes)

    def forward(self, raw_img, ripe_img):
        # Encode
        ripe_img_to_next_0, ripe_img_to_right_0, ripe_img_to_right_indices_0 = self.ripe_img_down_0(ripe_img)
        raw_img_to_next_0 = self.raw_img_down_0(raw_img)

        ripe_img_to_next_1, ripe_img_to_right_1, ripe_img_to_right_indices_1 = self.ripe_img_down_1(ripe_img_to_next_0)
        raw_img_to_next_1 = self.raw_img_down_1(raw_img_to_next_0)

        ripe_img_to_next_2, ripe_img_to_right_2, ripe_img_to_right_indices_2 = self.ripe_img_down_2(ripe_img_to_next_1)
        raw_img_to_next_2 = self.raw_img_down_2(raw_img_to_next_1)

        ripe_img_to_next_3, ripe_img_to_right_3, ripe_img_to_right_indices_3 = self.ripe_img_down_3(ripe_img_to_next_2)
        raw_img_to_next_3 = self.raw_img_down_3(raw_img_to_next_2)

        # Decode
        up_sample_0 = self.up_0(raw_img_to_next_3, ripe_img_to_right_3, ripe_img_to_right_indices_3)
        up_sample_1 = self.up_1(up_sample_0, ripe_img_to_right_2, ripe_img_to_right_indices_2)
        up_sample_2 = self.up_2(up_sample_1, ripe_img_to_right_1, ripe_img_to_right_indices_1)
        up_sample_3 = self.up_3(up_sample_2, ripe_img_to_right_0, ripe_img_to_right_indices_0)

        # Packing
        output = self.pack(up_sample_3)

        return output
