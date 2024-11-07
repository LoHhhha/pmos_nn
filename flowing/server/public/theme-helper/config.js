const themeHelperNamespace = {};
themeHelperNamespace.colorReplaceRule = {
    "--container-outline-color": "lucency-level-13-color",
    "--content-outline-color": "lucency-level-11-color",
    "--sub-content-outline-color": "lucency-level-9-color",
    "--container-background-color": "lucency-level-3-color",
    "--content-background-color": "lucency-level-5-color",
    "--sub-content-background-color": "lucency-level-6-color",
    "--viewport-background-color": "level-2-color",
    "--default-color": "level-14-color",
    "--disabled-color": "level-9-color",
};

/*
be the format as:
    theme-xxx-color {
        "lucency-level-X-color:...";
        
        "level-X-color:...";
    }
*/
themeHelperNamespace.color = {
    light: {
        "lucency-level-1-color": "rgba(255, 255, 255, 0.5)",
        "lucency-level-2-color": "rgba(238, 238, 238, 0.5)",
        "lucency-level-3-color": "rgba(221, 221, 221, 0.5)",
        "lucency-level-4-color": "rgba(204, 204, 204, 0.5)",
        "lucency-level-5-color": "rgba(187, 187, 187, 0.5)",
        "lucency-level-6-color": "rgba(170, 170, 170, 0.5)",
        "lucency-level-7-color": "rgba(153, 153, 153, 0.5)",
        "lucency-level-8-color": "rgba(136, 136, 136, 0.5)",
        "lucency-level-9-color": "rgba(119, 119, 119, 0.5)",
        "lucency-level-10-color": "rgba(102, 102, 102, 0.5)",
        "lucency-level-11-color": "rgba(85, 85, 85, 0.5)",
        "lucency-level-12-color": "rgba(68, 68, 68, 0.5)",
        "lucency-level-13-color": "rgba(51, 51, 51, 0.5)",
        "lucency-level-14-color": "rgba(34, 34, 34, 0.5)",
        "lucency-level-15-color": "rgba(17, 17, 17, 0.5)",
        "lucency-level-16-color": "rgba(0, 0, 0, 0.5)",

        "level-1-color": "rgb(255, 255, 255)",
        "level-2-color": "rgb(238, 238, 238)",
        "level-3-color": "rgb(221, 221, 221)",
        "level-4-color": "rgb(204, 204, 204)",
        "level-5-color": "rgb(187, 187, 187)",
        "level-6-color": "rgb(170, 170, 170)",
        "level-7-color": "rgb(153, 153, 153)",
        "level-8-color": "rgb(136, 136, 136)",
        "level-9-color": "rgb(119, 119, 119)",
        "level-10-color": "rgb(102, 102, 102)",
        "level-11-color": "rgb(85, 85, 85)",
        "level-12-color": "rgb(68, 68, 68)",
        "level-13-color": "rgb(51, 51, 51)",
        "level-14-color": "rgb(34, 34, 34)",
        "level-15-color": "rgb(17, 17, 17)",
        "level-16-color": "rgb(0, 0, 0)",
    },
    dark: {
        "lucency-level-1-color": "rgba(0, 0, 0, 0.5)",
        "lucency-level-2-color": "rgba(17, 17, 17, 0.5)",
        "lucency-level-3-color": "rgba(34, 34, 34, 0.5)",
        "lucency-level-4-color": "rgba(51, 51, 51, 0.5)",
        "lucency-level-5-color": "rgba(85, 85, 85, 0.5)",
        "lucency-level-6-color": "rgba(68, 68, 68, 0.5)",
        "lucency-level-7-color": "rgba(102, 102, 102, 0.5)",
        "lucency-level-8-color": "rgba(119, 119, 119, 0.5)",
        "lucency-level-9-color": "rgba(136, 136, 136, 0.5)",
        "lucency-level-10-color": "rgba(153, 153, 153, 0.5)",
        "lucency-level-11-color": "rgba(170, 170, 170, 0.5)",
        "lucency-level-12-color": "rgba(187, 187, 187, 0.5)",
        "lucency-level-13-color": "rgba(204, 204, 204, 0.5)",
        "lucency-level-14-color": "rgba(221, 221, 221, 0.5)",
        "lucency-level-15-color": "rgba(238, 238, 238, 0.5)",
        "lucency-level-16-color": "rgba(255, 255, 255, 0.5)",

        "level-1-color": "rgb(0, 0, 0)",
        "level-2-color": "rgb(17, 17, 17)",
        "level-3-color": "rgb(34, 34, 34)",
        "level-4-color": "rgb(51, 51, 51)",
        "level-5-color": "rgb(68, 68, 68)",
        "level-6-color": "rgb(85, 85, 85)",
        "level-7-color": "rgb(102, 102, 102)",
        "level-8-color": "rgb(119, 119, 119)",
        "level-9-color": "rgb(136, 136, 136)",
        "level-10-color": "rgb(153, 153, 153)",
        "level-11-color": "rgb(170, 170, 170)",
        "level-12-color": "rgb(187, 187, 187)",
        "level-13-color": "rgb(204, 204, 204)",
        "level-14-color": "rgb(221, 221, 221)",
        "level-15-color": "rgb(238, 238, 238)",
        "level-16-color": "rgb(255, 255, 255)",
    },
};
