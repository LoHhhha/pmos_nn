# Copyright © 2024 PMoS. All rights reserved.

import torch
import numpy as np


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
