# Copyright © 2024-2025 PMoS. All rights reserved.

import torch
import numpy as np
from datetime import datetime
from typing import Tuple
from matplotlib import pyplot as plt

from flowing.shower import Logger


def denormalize_batch(img_list: torch.tensor, mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5)):
    img_res = None
    for img in img_list:
        img_copy = img.clone()
        denormalize_single(img_copy, mean, std)
        if img_res is not None:
            img_res = torch.cat((img_res, torch.unsqueeze(img_copy, 0)), 0)
        else:
            img_res = torch.unsqueeze(img_copy, 0)
    return img_res


def denormalize_single(img: torch.tensor, mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5)):
    for t, m, s in zip(img, mean, std):
        t.mul_(s).add_(m)


def code2image(code: np.array, color_map: dict | list) -> np.array:
    code_shape = code.shape
    if len(code_shape) == 3:
        if code_shape[0] == 1:
            code_shape.squeeze(dim=0)
        else:
            code = code.argmax(axis=0)
        code_shape = code.shape
    if len(code_shape) != 2:
        raise ValueError(f'Code shape as {code_shape} is not supported.')
    r = np.ones_like(code).astype(np.uint8)
    g = np.zeros_like(code).astype(np.uint8)
    b = np.zeros_like(code).astype(np.uint8)
    for cls in color_map:
        idx = code == cls
        r[idx] = color_map[cls][0]
        g[idx] = color_map[cls][1]
        b[idx] = color_map[cls][2]
    image_final = np.stack([r, g, b], axis=2)
    return image_final


def visualize(
        title: str = None,
        save_path: str = None,
        row_amount: int = 1,
        img_title_show: bool = True,
        plot_size: Tuple[int, int] = (16, 8),
        **images
):
    """
    - args:
        title: plot title, it will add datetime.now() before being showed
        save_path: if to save the plot, when save_path is ''
        row_amount: the number of rows to show the images got, row_amount=2 means there will be two rows in the plot
        img_title_show: if to show each image title
        plot_size: the size of the plot
        images: the images being to show
    """
    n = int((len(images) + row_amount - 1) / row_amount)
    plt.figure(figsize=plot_size)

    if title is None:
        title = ''
    title += f"\n{datetime.now()}"
    plt.suptitle(title)

    for i, (name, image) in enumerate(images.items()):
        plt.subplot(row_amount, n, i + 1)
        plt.xticks([])
        plt.yticks([])
        if img_title_show:
            plt.title(' '.join(name.split('_')).title())
        if isinstance(image, torch.Tensor):
            plt.imshow(image.moveaxis(0, 2))
        else:
            plt.imshow(image)

    if save_path is not None:
        try:
            plt.savefig(save_path)
            Logger.info(f"Save figure successfully to '{save_path}'.\n")
        except Exception as e:
            Logger.error("Cannot save figure.\n" + str(e))

    plt.show()
