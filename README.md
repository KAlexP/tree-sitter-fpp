# Install Instructions


## File Tree

```
.
├── grammar.js
├── package.json
├── queries
│   └── fpp
│       └── highlights.scm
├── README.md
└── src
    ├── grammar.json
    ├── node-types.json
    ├── parser.c
    └── tree_sitter
        ├── alloc.h
        ├── array.h
        └── parser.h
```

## Instructions

Nvim needs to know where the parser.c file is. Add the following lua to your init.lua file

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()

parser_config.fpp = {
    install_info = {
        url = "/path/to/this/folder/",
        files = {"src/parser.c"},
        branch = "main",
    },
    filetype = "fpp",
}
```

Nvim also needs to recognize f prime prime files; add the following to your nvim config files (init.lua).

```lua
vim.filetype.add({
    extension = {
        fpp = 'fpp',
    },
})

vim.api.nvim.nvim_create_autocmd("Filetype", {
    pattern = "fpp",
    callback = function()
    vim.treesitter.start()
    end,
})
```

The queries directory needs to be placed in the nvim config directory the path should be 

```
~/.config/nvim/queries/fpp/highlights.scm
```

The next step to get the parser to work is entering `:TSInstall fpp` in any nvim file. You should now close and reopen nvim with a f prime prime file and the syntax should be highlighted.
