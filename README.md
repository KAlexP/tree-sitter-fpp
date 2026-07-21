> [!WARNING]
> This is in pre-release it will not be completely functional.
> This is not an official parser. For an official syntax highlighter and 
> grammar check use Visual Studio Code. This project is meant to provide basic 
> syntax highlighting in neovim and similar editors.

# Installation Instructions

## Directory File System
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
2. Install Dependencies
```
tree-sitter:~> 0.26.9
gcc: ~ 16.1.1
nvim: ~ v0.12.4
```
3. You need to add the necessary configurations for nvim to locate the parser. The first block of code is in `lazy/fpp.lua` file, the next block is in `lazy/treesitter.lua` file.
    - The following registers fpp as a language, enables comment toggling, and sets up error highlighting.
    ```lua
    -- This maps the filetype for nvim to activate highlighting
    vim.filetype.add({
      extension = { 
        fpp = "fpp",
      },
    })
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
    -- The following sets up Error Highlighting
    local fpp_diag_ns = vim.api.nvim_create_namespace("fpp_tree_sitter_errors")

    vim.api.nvim_create_autocmd({ "BufWritePost", "BufWinEnter", "TextChanged", "TextChangedI" }, {
      pattern = "*.fpp",
      callback = function(args)
        local bufnr = args.buf
        
        vim.diagnostic.reset(fpp_diag_ns, bufnr)
        
        local parser = vim.treesitter.get_parser(bufnr, "fpp", { error = false })
        if not parser then return end
        
        local tree = parser:parse()[1]
        local root = tree:root()
        
        local query = vim.treesitter.query.parse("fpp", "(ERROR) @error_node")
        local diagnostics = {}
        
        for _, node, _ in query:iter_captures(root, bufnr, 0, -1) do
          local start_row, start_col, end_row, end_col = node:range()
          
          table.insert(diagnostics, {
            lnum = start_row,
            col = start_col,
            end_lnum = end_row,
            end_col = end_col,
            severity = vim.diagnostic.severity.ERROR,
            message = "Tree-sitter Parsing Error: Syntax invalid or structural block unclosed.",
            source = "Tree-Sitter",
          })
        end
        
        vim.diagnostic.set(fpp_diag_ns, bufnr, diagnostics)
      end,
    })
    return {}

    ```
    - The following is my treesitter configuration to add fpp as a local parser.
    ```lua
    return {
      'nvim-treesitter/nvim-treesitter',
      branch = 'main',
      lazy = false,        -- avoid missing the first buffer's FileType event
      build = ':TSUpdate',
      config = function()
        local langs = {
          "lua", "c", "cpp", "rust", "python", "fortran", "markdown", 
          "javascript", "fpp",
        }

        -- register the custom fpp parser BEFORE installing
        vim.api.nvim_create_autocmd('User', {
          pattern = 'TSUpdate',
          callback = function()
            require('nvim-treesitter.parsers').fpp = {
              install_info = {
                path = vim.fn.expand("~/path/to/this/repo"), -- local checkout
                files = { "src/parser.c" },
              },
              tier = 2, -- required, or it gets silently skipped
            }
          end,
        })

        require('nvim-treesitter').install(langs)

        -- highlighting/indent must be turned on manually now
        vim.api.nvim_create_autocmd('FileType', {
          pattern = langs,
          callback = function()
            pcall(vim.treesitter.start)
            vim.bo.indentexpr = "v:lua.require('nvim-treesitter').indentexpr()"
          end,
        })
      end,
    }
    ```
4. With all the nvim stuff taken care of to get color the queries directory needs to be placed in a place nvim will find it.
    - The `queries` directory should be placed in the directory
    ```bash
        ~/.config/nvim/queries/fpp/highlights.scm
    ```
    This can be accomplished by creating a symlink or copying the file directly. It is recomended to create a symlink so you don't copy the highlights.scsm file more than necessary if it is changed.

    A symlink can be created like so
    ```bash
        mkdir -p ~/.config/nvim/queries
        ln -s ~/path/to/this/repo/queries/fpp ~/.config/nvim/queries/fpp
    ```
    or you can copy it. (not recommended)
    ```bash
        mkdir -p ~/.config/nvim/queries/fpp
        cp ~/path/to/this/repo/queries/fpp/highlights.scm ~/.config/nvim/queries/fpp/
    ```
5. The next step to get the parser to work is by having tree-sitter install the parser.
    - This can be acomplished by running
    ```vim
        :TSUpdate
        :TSInstall fpp
    ```
    If you pull an update you should run
    ```vim
        :TSInstall! fpp
    ```
    to recompile the parser.
6. Verify the parser is working.
    - Once the last step is completed relaunch nvim with a fpp file and run
    ```vim
        :InspectTree
    ```
    If a buffer appears with a tree of the document you are in and the syntax highlighting
    shows up the parser is working.
