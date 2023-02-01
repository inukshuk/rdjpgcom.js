rdjpgcom.js
===========
[![ci](https://github.com/inukshuk/rdjpgcom.js/actions/workflows/ci.yml/badge.svg)](https://github.com/inukshuk/rdjpgcom.js/actions/workflows/ci.yml)

Read text comments from JPEG files using pure JavaScript.
Inspired by the CLI tool of the same name,
included in the Independet JPEG Group's [jpegtran][].

[jpegtran]: https://www.ijg.org

Installation
------------
    npm install rdjpgcom

Usage
-----
    import { readFile } from 'node:fs/promises'
    import rdjpgcom from 'rdjpgcom'

    let buffer = await readFile('image.jpg')
        
    // To read all valid UTF-8 comments:
    rdjpgcom(buffer, { encoding: 'utf-8' })
    
    // To receive all comment segments including raw `payload` buffers:
    rdjpgcom(buffer, { encoding: null })

Credits
-------
    Copyright (c) 2023, Sylvester Keil

This library is a derived work, inspired by `rdjpgcom.c` and

    Copyright (C) 1994-1997, Thomas G. Lane.
    Modified 2009 by Bill Allombert, Guido Vollbeding
