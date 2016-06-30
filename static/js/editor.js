
fabric.Object.prototype.customiseCornerIcons( {
    settings: {
        borderColor: 'red',
        cornerSize: 25,
        cornerBackgroundColor: 'red',
        cornerShape: 'circle',
        cornerPadding: 10
    },
    tl: {
        action: 'rotate',
        icon: 'icons/rotate.svg'
    },
    tr: {
        action: 'scale'
        icon: 'icons/scale.svg'
    },
    bl: {
        action: 'remove',
        icon: 'icons/remove.svg'
    },
    br: {
        action: 'moveUp',
        icon: 'icons/layer-up.svg'
    },
    mb: {
        action: 'moveDown',
        icon: 'icons/layer-down.svg'
    },
    // mt: {
    //     icon: 'icons/acute.svg'
    // },
    // mr: {
    //     icon: 'icons/repair-tools-cross.svg'
    //         }
});