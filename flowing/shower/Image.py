# Copyright © 2024 PMoS. All rights reserved.

import torch
from typing import Tuple
from datetime import datetime
from matplotlib import pyplot as plt

from flowing.shower import Logger


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
