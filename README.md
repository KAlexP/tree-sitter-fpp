> [!WARNING]
> This is an early version and will be broken

# Installation Instructions

## Useful Files
```bash
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

## Install Instructions
1. Clone the repo
2. You need to add things to your nvim configs. The following is shown in init.lua, but it can be placed in a different file as long as it is included `require('file')`. See the bottom of the file for an example init to paste into your file.
    - You need to add the filetype to nvim with the following 
    ```lua
        vim.filetype.add({
          extension = { 
            fpp = "fpp",
          },
        })
    ```
    - The next step is to give the location of the parser to nvim
    ```lua
        local status, parsers = pcall(require, "nvim-treesitter.parsers")
        if status then
          parsers.fpp = {
            install_info = {
              url = vim.fn.expand("~/path/to/parser"),
              files = {"src/parser.c"},
            },
            filetype = "fpp",
          }
        end
    ```
    - Then the language needs to registered
    ```lua
        vim.treesitter.language.register("fpp", "fpp") 
    ```
    - If you want to toggle comments you need
    ```lua
        vim.api.nvim_create_autocmd("FileType", {
          pattern = "fpp",
          callback = function()
            vim.bo.commentstring = "# %s"
            pcall(vim.treesitter.start)
          end,
        })
    ```
    - If you want to specify different colors the syntax is shown below
    ```lua
        vim.api.nvim_set_hl(0, "@comment.documentation", { fg = "#D2B48C", italic = true })
    ```
3. With all the nvim stuff taken care of to get color the queries directory needs to be placed in a place nvim will find it.
    - The `queries` directory should be located in the directory
    ```bash
        ~/.config/nvim/queries/fpp/highlights.scm
    ```
The next step to get the parser to work is entering `:TSInstall fpp` in any nvim file. You should now close and reopen nvim with a f prime prime file and the syntax should be highlighted.

## Example init.lua file
```lua
-- NVIM configuration preferences
vim.opt.clipboard = 'unnamedplus'
vim.opt.tabstop = 2
vim.opt.termguicolors = true
-- This maps the filetype for nvim to activate highlighting
vim.filetype.add({
  extension = { 
    fpp = "fpp",
  },
})
-- Tell nvim the location of the parser
local status, parsers = pcall(require, "nvim-treesitter.parsers")
if status then
  parsers.fpp = {
    install_info = {
      url = vim.fn.expand("~/fprime-projs/tree-sitter-fpp"), -- expand ~ to your absolute home path
      files = {"src/parser.c"},
    },
    filetype = "fpp",
  }
end
-- Register the language engine name mapping
vim.treesitter.language.register("fpp", "fpp")
-- This adds comment/uncomment support and starts highlighting safely
vim.api.nvim_create_autocmd("FileType", {
  pattern = "fpp",
  callback = function()
    vim.bo.commentstring = "# %s"
    pcall(vim.treesitter.start)
  end,
})
-- Sets the color of the @ comments to be tan
vim.api.nvim_set_hl(0, "@comment.documentation", {fg = "#D2B48C}, italic = true)
```
