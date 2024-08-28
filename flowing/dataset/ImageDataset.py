# Copyright © 2024 PMoS. All rights reserved.

import cv2
import torchvision
import tqdm
import torch
import torch.utils.data
import torchvision.transforms.functional
from typing import Tuple, Callable
import numpy as np
import os

from flowing.shower import Logger


class ImageDataset(torch.utils.data.Dataset):
    """
    Only to solve one data flow, plz repeated use this class to push more than one data flows once.

    Process of self.__getitem__:
        - Load data from memory, maybe use <read_data_function> to do this
        - ToTensor and Resize data
        - <Transform> (data)
        - Flip data
        - <change_function> (data)
            - adjust the number of channels
            - change type of data

    Args:
        directory: data's directory, it contains all this flow's file. E.g.: data_dir = "./data/train"

        resolution: flow's image target resolution (H, W). E.g.: resolution = (192, 384)

        read_data_function: function that helps to read data from memory, which is like "def xx(path:str)->np.array".
            E.g.:
                def get_data(path:str)->np.array:
                    return np.array(cv2.imread(path))

                Def get_data(path:str)->np.array:
                    return np.load(path)

        transform: flow's image transform to be applied to images.
            E.g.: transform = torchvision.transforms.Compose([...])
            tips: transform don't need to contain ToTensor/Resize

        change_function: function that changes the image, which is like "def xx(data:torch.Tensor)->torch.Tensor".
            E.g.:
                def change(data:torch.Tensor)->torch.Tensor:
                    data = data.squeeze(0)
                    return data.long()

        read_to_mem_at_start: whether to read images from memory at the start.
            E.g.: read_to_mem_at_start = True

        max_size: maximum size of images to use. E.g.: max_size = 1024

        data_add_horizontal_flip: whether to add horizontally flipped images to dataset.
            E.g.: data_add_horizontal_flip = False

        data_add_vertical_flip: whether to add vertically flipped images to dataset.
            E.g.: data_add_vertical_flip = False
    """

    def __init__(self,
                 directory: str,
                 resolution: Tuple[int, int],
                 read_data_function: Callable = None,
                 transform: torchvision.transforms.Compose | None = None,
                 change_function: Callable = None,
                 read_to_mem_at_start: bool = False,
                 max_size: int = np.inf,
                 data_add_horizontal_flip: bool = False,
                 data_add_vertical_flip: bool = False,
                 ):
        # transform
        self.transform_default = torchvision.transforms.Compose([
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Resize(
                resolution,
                antialias=False,
                interpolation=torchvision.transforms.functional.InterpolationMode.NEAREST
            )
        ])
        self.transform = transform

        self.read_data_function = read_data_function

        self.change_function = change_function

        # data path
        self.data_path = [os.path.join(directory, image_name) for image_name in os.listdir(directory)]
        self.data_path = [path for path in self.data_path if os.path.isfile(path)]
        self.data_path = self.data_path[:min(max_size, len(self.data_path))]

        # whether read now
        self.read_to_mem_at_start = read_to_mem_at_start
        if self.read_to_mem_at_start:
            tq = tqdm.tqdm(iterable=self.data_path, desc=f"DataSet[{directory}] Reading")
            self.data_tensor = []
            for path in tq:
                if self.read_data_function is None:
                    self.data_tensor.append(self.transform_default(np.array(cv2.imread(path))))
                else:
                    self.data_tensor.append(self.transform_default(read_data_function(path)))
            tq.close()

        # flip
        self.data_add_horizontal_flip = data_add_horizontal_flip
        self.data_add_vertical_flip = data_add_vertical_flip

        self.length = len(self.data_path)
        if self.data_add_horizontal_flip:
            self.length *= 2
        if self.data_add_vertical_flip:
            self.length *= 2

        self.directory = directory
        Logger.info(self)

    def shape(self):
        return self[0].shape if self.length > 0 else None

    def __getitem__(self, i):
        need_horizontal_flip, need_vertical_flip = False, False
        if self.data_add_horizontal_flip and self.data_add_vertical_flip:
            current_data_idx = i >> 2
            if i & 2:
                need_horizontal_flip = True
            if i & 1:
                need_vertical_flip = True
        elif self.data_add_horizontal_flip or self.data_add_vertical_flip:
            current_data_idx = i >> 1
            if i & 1:
                if self.data_add_vertical_flip:
                    need_vertical_flip = True
                if self.data_add_horizontal_flip:
                    need_horizontal_flip = True
        else:
            current_data_idx = i

        if not self.read_to_mem_at_start:
            if self.read_data_function is None:
                current_data = np.array(cv2.imread(self.data_path[current_data_idx]))
            else:
                current_data = self.read_data_function(self.data_path[current_data_idx])
            current_data_tensor = self.transform_default(current_data)
        else:
            current_data_tensor = self.data_tensor[current_data_idx]

        if self.transform is not None:
            current_data_tensor = self.transform(current_data_tensor)

        # flip
        # current_data_tensor.shape is (C, H, W)
        if need_horizontal_flip:
            current_data_tensor = torch.flip(current_data_tensor, dims=[2])
        if need_vertical_flip:
            current_data_tensor = torch.flip(current_data_tensor, dims=[1])

        if self.change_function is not None:
            current_data_tensor = self.change_function(current_data_tensor)

        return current_data_tensor

    def __len__(self):
        return self.length

    def __repr__(self):
        return ("ImageDataset("
                f"directory:'{self.directory}', "
                f"transform:{self.transform}, "
                f"size:{self.length}, "
                f"data_add_horizontal_flip:{self.data_add_horizontal_flip}, "
                f"data_add_vertical_flip:{self.data_add_vertical_flip}, "
                f"read_to_mem_at_start:{self.read_to_mem_at_start},"
                f"data_shape:{self.shape()})")
