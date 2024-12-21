# Copyright © 2024 PMoS. All rights reserved.

import numpy as np
import torch

from flowing.checker import Classification
from flowing.shower import Image as ImageShower
from flowing.helper import Image as ImageHelper
from flowing.dataset import ImageDataset, LinkDataset
from flowing.builder import Action, Build, ActionCode as Ac

from net.hNet import hNet
from net.DehazeNet import DehazeNet

COLORMAP = {
    0: (0, 0, 0), 1: (0, 0, 0), 2: (0, 0, 0), 3: (0, 0, 0), 4: (0, 0, 0), 5: (111, 74, 0), 6: (81, 0, 81),
    7: (128, 64, 128), 8: (244, 35, 232), 9: (250, 170, 160), 10: (230, 150, 140), 11: (70, 70, 70),
    12: (102, 102, 156), 13: (190, 153, 153), 14: (180, 165, 180), 15: (150, 100, 100), 16: (150, 120, 90),
    17: (153, 153, 153), 18: (153, 153, 153), 19: (250, 170, 30), 20: (220, 220, 0), 21: (107, 142, 35),
    22: (152, 251, 152), 23: (70, 130, 180), 24: (220, 20, 60), 25: (255, 0, 0), 26: (0, 0, 142),
    27: (0, 0, 70), 28: (0, 60, 100), 29: (0, 0, 90), 30: (0, 0, 110), 31: (0, 80, 100), 32: (0, 0, 230),
    33: (119, 11, 32)
}

resolution = (128, 256)
dataset_size = 1000
train_epoch_amount = 10
batch_size = 18
lr = 1e-3
debug_mode = False

# get Imagedataset for img
img_dataset = ImageDataset(
    directory='./cityscapes_foggy/val_img',
    resolution=resolution,
    data_add_vertical_flip=True,
    data_add_horizontal_flip=True,
    max_size=dataset_size,
    read_to_mem_at_start=True
)

# get Imagedataset for foggy
foggy_dataset = ImageDataset(
    directory='./cityscapes_foggy/val_foggy',
    resolution=resolution,
    data_add_vertical_flip=True,
    data_add_horizontal_flip=True,
    max_size=dataset_size,
    read_to_mem_at_start=True
)

# get ImageDataset for gt
gt_dataset = ImageDataset(
    directory='./cityscapes_foggy/val_gt',
    resolution=resolution,
    max_size=dataset_size,
    data_add_vertical_flip=True,
    data_add_horizontal_flip=True,
    read_data_function=lambda path: np.load(path),
    change_function=lambda x: x.squeeze(0).long(),
    read_to_mem_at_start=True
)

# link two ImageDataset
ld = LinkDataset(
    img_dataset,
    foggy_dataset,
    gt_dataset,
)

# get DataLoader for LinkDataset
ld_loader = torch.utils.data.DataLoader(ld, batch_size=batch_size, shuffle=True)

# get models
h_net = hNet(num_classes=len(COLORMAP))
dehaze_net = DehazeNet()
models = [
    ("hNet", h_net),
    ("dehazeNet", dehaze_net),
]

# get optimizers
optimizers = [
    torch.optim.Adam(h_net.parameters(), lr=lr),
    torch.optim.Adam(dehaze_net.parameters(), lr=lr),
]

# get criteria
criteria = [
    torch.nn.CrossEntropyLoss(),
    torch.nn.L1Loss(),
]


def show_image(train_times: int, img, foggy, dehaze, gt, predict):
    if train_times % 50 != 0:
        return

    ImageShower.visualize(
        title=f"train_detail_in_{train_times}",
        row_amount=2,
        img=img[0].detach().cpu(),
        foggy=foggy[0].detach().cpu(),
        dehaze=dehaze[0].detach().cpu(),
        gt=ImageHelper.code2image(gt[0].detach().cpu(), COLORMAP),
        predict=ImageHelper.code2image(predict[0].detach().argmax(dim=0).cpu(), COLORMAP),
    )


# actions
# data_buffer [img, foggy, gt]
train_actions = [
    Action(action_type=Ac.FORWARD, model_idx=1, data_idx_list=[1]),
    Action(action_type=Ac.FORWARD, model_idx=0, data_idx_list=[1, 3]),
    Action(action_type=Ac.CRITERION, model_idx=1, loss_func_idx=1, data_idx_list=[3, 0], weight=1.0),
    Action(action_type=Ac.CRITERION, model_idx=0, loss_func_idx=0, data_idx_list=[4, 2], weight=1.0),
    Action(action_type=Ac.BACKWARD, model_idx=0),
    Action(action_type=Ac.BACKWARD, model_idx=1),
    Action(action_type=Ac.OPT_STEP),
    Action(action_type=Ac.GET_INFO, calculate_function=Classification(label_size=len(COLORMAP)), data_idx_list=[4, 2]),
]

valid_actions = [
    Action(action_type=Ac.FORWARD, model_idx=1, data_idx_list=[1]),
    Action(action_type=Ac.FORWARD, model_idx=0, data_idx_list=[1, 3]),
    Action(action_type=Ac.CRITERION, model_idx=1, loss_func_idx=1, data_idx_list=[3, 0], weight=1.0),
    Action(action_type=Ac.CRITERION, model_idx=0, loss_func_idx=0, data_idx_list=[4, 2], weight=1.0),
    Action(action_type=Ac.GET_INFO, calculate_function=Classification(label_size=len(COLORMAP)), data_idx_list=[4, 2]),
    Action(action_type=Ac.GET_DATA, read_function=show_image, data_idx_list=[0, 1, 3, 2, 4]),
]

if __name__ == '__main__':
    Build.build(
        train_data_loader=ld_loader,
        val_data_loader=ld_loader,
        models=models,
        optimizers=optimizers,
        criteria=criteria,
        train_actions=train_actions,
        val_actions=valid_actions,
        model_save_dir="./params",
        device=torch.device("cuda"),
        current_epoch=0,
        val_after_train_epoch=2,
        save_after_train_epoch=2,
        train_epoch_amount=train_epoch_amount,
        debug_mode=debug_mode,
    )
