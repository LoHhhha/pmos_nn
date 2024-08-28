# Copyright © 2024 PMoS. All rights reserved.

import torch
import torch.utils.data

from flowing.shower import Logger


class LinkDataset(torch.utils.data.Dataset):
    """
    Using this class to combine all flows that need in one train.
    Notice: each dataset must have the same number of samples, and the same order.

    Args:
        *datasets: all flows needed in train. E.g.: *datasets = (dataset_1, dataset_2, dataset_3)
    """

    def __init__(self, *datasets):
        self.datasets = datasets
        for dataset in datasets:
            if not isinstance(dataset, torch.utils.data.Dataset):
                raise TypeError("Dataset must be of type torch.utils.data.Dataset")
        self.dataset_len = len(self.datasets[0])
        for dataset in self.datasets:
            if self.dataset_len != len(dataset):
                raise ValueError("Length of datasets does not match")

        Logger.info(self)

    def __getitem__(self, i):
        return [dataset[i] for dataset in self.datasets]

    def __len__(self):
        return self.dataset_len

    def get_item_size(self):
        return len(self.datasets)

    def __repr__(self):
        return f"LinkDataset(datasets:{self.datasets}, size:{self.dataset_len})"
