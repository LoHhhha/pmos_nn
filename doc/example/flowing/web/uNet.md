```json
{
  "nodes": [
    {
      "apiName": "Input",
      "content": {
        "name": "input_0",
        "shape": "(1,3,256,256)"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "3",
        "out_channels": "64",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "64",
        "out_channels": "64",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "None",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "64",
        "out_channels": "128",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "128",
        "out_channels": "128",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "None",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "128",
        "out_channels": "256",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "256",
        "out_channels": "256",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "None",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "256",
        "out_channels": "512",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "512",
        "out_channels": "512",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "None",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "512",
        "out_channels": "1024",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "1024",
        "out_channels": "1024",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "ConvTranspose2d",
      "content": {
        "in_channels": "1024",
        "out_channels": "512",
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "output_padding": "0",
        "groups": "1",
        "bias": "True",
        "dilation": "1"
      }
    },
    {
      "apiName": "Cat",
      "content": {
        "dim": "1"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "1024",
        "out_channels": "512",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "512",
        "out_channels": "512",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "ConvTranspose2d",
      "content": {
        "in_channels": "512",
        "out_channels": "256",
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "output_padding": "0",
        "groups": "1",
        "bias": "True",
        "dilation": "1"
      }
    },
    {
      "apiName": "Cat",
      "content": {
        "dim": "1"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "512",
        "out_channels": "256",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "256",
        "out_channels": "256",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "ConvTranspose2d",
      "content": {
        "in_channels": "256",
        "out_channels": "128",
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "output_padding": "0",
        "groups": "1",
        "bias": "True",
        "dilation": "1"
      }
    },
    {
      "apiName": "Cat",
      "content": {
        "dim": "1"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "256",
        "out_channels": "128",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "128",
        "out_channels": "128",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "ConvTranspose2d",
      "content": {
        "in_channels": "128",
        "out_channels": "64",
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "output_padding": "0",
        "groups": "1",
        "bias": "True",
        "dilation": "1"
      }
    },
    {
      "apiName": "Cat",
      "content": {
        "dim": "1"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "128",
        "out_channels": "64",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "64",
        "out_channels": "64",
        "kernel_size": "3",
        "stride": "1",
        "padding": "1",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "ReLU",
      "content": {
        "inplace": "False"
      }
    },
    {
      "apiName": "Conv2d",
      "content": {
        "in_channels": "64",
        "out_channels": "3",
        "kernel_size": "1",
        "stride": "1",
        "padding": "0",
        "padding_mode": "zeros",
        "dilation": "1",
        "groups": "1",
        "bias": "True"
      }
    },
    {
      "apiName": "Output",
      "content": {
        "name": "output_0"
      }
    }
  ],
  "connections": [
    {
      "srcNodeIdx": 0,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 1,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 1,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 2,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 2,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 3,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 3,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 4,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 4,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 5,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 5,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 6,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 6,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 7,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 7,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 8,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 8,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 9,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 9,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 10,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 10,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 11,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 11,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 12,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 12,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 13,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 13,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 14,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 14,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 15,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 15,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 16,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 16,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 17,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 17,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 18,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 18,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 19,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 19,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 20,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 20,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 21,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 21,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 22,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 22,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 23,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 23,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 24,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 24,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 25,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 25,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 26,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 18,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 26,
      "tarEndpointIdx": 1
    },
    {
      "srcNodeIdx": 26,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 27,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 27,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 28,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 28,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 29,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 29,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 30,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 30,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 31,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 31,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 32,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 13,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 32,
      "tarEndpointIdx": 1
    },
    {
      "srcNodeIdx": 32,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 33,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 33,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 34,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 34,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 35,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 35,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 36,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 36,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 37,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 37,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 38,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 8,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 38,
      "tarEndpointIdx": 1
    },
    {
      "srcNodeIdx": 38,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 39,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 39,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 40,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 40,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 41,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 41,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 42,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 42,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 43,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 43,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 44,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 3,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 44,
      "tarEndpointIdx": 1
    },
    {
      "srcNodeIdx": 44,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 45,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 45,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 46,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 46,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 47,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 47,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 48,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 48,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 49,
      "tarEndpointIdx": 0
    },
    {
      "srcNodeIdx": 49,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 50,
      "tarEndpointIdx": 0
    }
  ]
}
```

Generated by DeepSeek R1.
