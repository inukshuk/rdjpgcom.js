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
    import { rdjpgcom } from 'rdjpgcom'

    let buffer = await readFile('image.jpg')
        
    // To read all valid UTF-8 comments:
    let comments = rdjpgcom(buffer)
    
    // You can pass a different encoding as an option.

    // To see all comment segments and their raw `payload` buffers use:
    for (let segment of rdjpgcom(buffer, { encoding: null })) {
      segment.payload
    }

Acknowledgements
----------------
This module is a derived work inspired by `rdjpgcom.c` and

    Copyright (C) 1994-1997, Thomas G. Lane.
    Modified 2009 by Bill Allombert, Guido Vollbeding

License
-------
rdjpgcom.js is licensed under the terms of the BSD-2-Clause license.
See the LICENSE file for details.
