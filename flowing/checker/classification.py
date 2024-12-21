# Copyright © 2024 PMoS. All rights reserved.

import torch
from typing import List
import numpy as np
from collections.abc import Mapping


class _ClassificationMetric(Mapping):
    precision: np.array
    recall: np.array
    IoU: np.array
    F1: np.array

    accuracy: float
    m_precision: float
    m_recall: float
    m_IoU: float
    macro_F1: float

    """
    predict
       |
           a   b  -- actual
       a  TP  FP
       b  FN  TN
    P: Positive -> current considering
    N: Negative -> others
    
    
    To class a:
        - precision   TP/(TP+FP)
        - recall      TP/(TP+FN)
        - iou         TP/(TP+FP+FN)
        - f1          2*(recall*precision)/(recall+precision)
    - accuracy        (TP+TN)/(TP+TN+FP+FN)
    - macro_F1        2*(m_recall*m_precision)/(m_recall+m_precision)
    """

    def __init__(self, label_size: int):
        self.precision = np.zeros(label_size, dtype=np.float64)
        self.recall = np.zeros(label_size, dtype=np.float64)
        self.IoU = np.zeros(label_size, dtype=np.float64)
        self.F1 = np.zeros(label_size, dtype=np.float64)
        self.accuracy = -1
        self.m_precision = -1
        self.m_recall = -1
        self.m_IoU = -1
        self.macro_F1 = -1

    def __dict(self):
        return {
            "m_precision": self.m_precision,
            "m_recall": self.m_recall,
            "m_IoU": self.m_IoU,
            "accuracy": self.accuracy,
            "macro_F1": self.macro_F1,
        }

    def __getitem__(self, __key):
        return self.__dict()[__key]

    def __iter__(self):
        return iter(self.__dict())

    def __len__(self):
        return len(self.__dict())

    def __repr__(self):
        return (f"ClassificationMetric("
                f"m_precision:{self.m_precision:.3f},"
                f"m_recall:{self.m_recall:.3f},"
                f"m_IoU:{self.m_IoU:.3f},"
                f"accuracy:{self.accuracy:.3f},"
                f"macro_F1:{self.macro_F1:.3f})")


class Classification:
    info: _ClassificationMetric = None

    def __init__(
            self,
            label_name_list: List[str] = None,
            label_size: int = None):
        if label_name_list is not None:
            self.label_name_list = label_name_list
            self.label_size = len(label_name_list)
        elif label_size is not None:
            self.label_size = label_size
            self.label_name_list = [f"label_{idx}" for idx in range(label_size)]
        else:
            raise ValueError("Classification: must provide label_name_list or label_size.")

        self.confusion_matrix = np.zeros((self.label_size, self.label_size), dtype=np.int64)
        self.info = _ClassificationMetric(label_size=label_size)

    @torch.no_grad()
    def __call__(self, predict: torch.Tensor, gt: torch.Tensor) -> _ClassificationMetric:
        """
        predict: (batch, label_size, ...) / predict: (batch, ...)
        gt: (batch, ...)
        """
        predict = predict.detach()
        gt = gt.detach().cpu().numpy()

        predict_shape = np.array(predict.shape)
        gt_shape = np.array(gt.shape)
        if gt.dtype not in (np.int8, np.int16, np.int32, np.int64, np.uint8, np.uint16, np.uint32, np.uint64):
            raise ValueError("Classification: gt must be integer.")

        if len(predict_shape) != len(gt_shape):
            predict = predict.argmax(axis=1)
            predict_shape = np.array(predict.shape)
        predict = predict.cpu().numpy()

        unequal_count = np.sum(predict_shape != gt_shape)

        if unequal_count > 0:
            raise ValueError(
                f"Classification: predict and gt must have same shape or as that after argmax(), "
                f"be get {predict_shape}, {gt_shape}."
            )

        predict = predict.ravel()
        gt = gt.ravel()

        # much faster than "for..."
        np.add.at(self.confusion_matrix, (predict, gt), 1)

        self.__update()
        return self.info

    def __update(self):
        true_count, tol_count = 0, 0
        for class_idx in range(self.label_size):
            current = self.confusion_matrix[class_idx][class_idx]

            tol_act = np.sum(self.confusion_matrix[:, class_idx])
            tol_pre = np.sum(self.confusion_matrix[class_idx, :])

            true_count += current
            tol_count += tol_act

            precision = current / tol_pre if tol_pre > 0 else 1.0
            recall = current / tol_act if tol_act > 0 else 1.0
            IoU = current / (tol_act + tol_pre - current) if tol_act + tol_pre > current else 1.0
            F1 = 2 * (recall * precision) / (recall + precision) if recall + precision > 0 else 1.0

            self.info.precision[class_idx] = precision
            self.info.recall[class_idx] = recall
            self.info.IoU[class_idx] = IoU
            self.info.F1[class_idx] = F1

        self.info.accuracy = true_count / tol_count if tol_count > 0 else 1.0
        self.info.m_precision = np.mean(self.info.precision)
        self.info.m_recall = np.mean(self.info.recall)
        self.info.m_IoU = np.mean(self.info.IoU)
        self.info.macro_F1 = np.mean(self.info.F1)


# test
if __name__ == "__main__":
    p = torch.randn((1, 3, 256, 256))
    g = torch.randn((1, 3, 256, 256)).argmax(dim=1)

    c = Classification(label_size=3)
    c(p, g)

    print(c.confusion_matrix)
    print(c.info)
