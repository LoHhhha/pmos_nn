```json
{
  "nodes": [
    {
      "apiName": "Input",
      "content": {
        "name": "None",
        "shape": "(1,3,256,256)"
      }
    },
    {
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
      }
    },
    {
      "apiName": "MaxPool2d",
      "content": {
        "kernel_size": "2",
        "stride": "2",
        "padding": "0",
        "dilation": "1",
        "return_indices": "False",
        "ceil_mode": "False"
      }
    },
    {
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
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
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
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
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
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
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
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
      "apiName": "Sequential",
      "content": {
        "modules": [
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
          }
        ]
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
        "name": "None"
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
      "srcNodeIdx": 7,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 11,
      "tarEndpointIdx": 1
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
      "srcNodeIdx": 5,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 14,
      "tarEndpointIdx": 1
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
      "srcNodeIdx": 3,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 17,
      "tarEndpointIdx": 1
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
      "srcNodeIdx": 1,
      "srcEndpointIdx": 0,
      "tarNodeIdx": 20,
      "tarEndpointIdx": 1
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
    }
  ]
}
```

Generated by DeepSeek R1.
