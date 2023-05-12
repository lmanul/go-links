---
title: Go
---

# Installation

## Get the extension

This is only available for Chrome right now (sorry). The extension is still
being approved in the Chrome webstore, so you need to install it manually for
now.

Start by **downloading the extension** from its
[GitHub Page](https://github.com/lmanul/go-links). Click on the green
button and select "Download ZIP":

![](img/github.png)

And unzip the archive you've downloaded. Back in Chrome, head to **Extensions**:

![](img/extensions_menu.png)

If it's off, flip the "**developer**" toggle (top right). Then click on "**Load
unpacked**" (top left).

![](img/developer_toggle.png)

Select the folder you have just unzipped.

## Set a keyboard shortcut

On this same Extensions page, click on the top left "hamburger" menu:

![](img/extensions_hamburger.png)

and pick "Keyboard Shortcuts". Find the "Go" extension and click on the "edit"
button:

![](img/edit_shortcut.png)

I recommend `Ctrl-G` and will be assuming that below.

# Configuration

The extension gets its shortcut definitions from an JSON file that it updates
regularly. The JSON file needs to have the following structure:

```
{
  "### Hello ###": "Keys starting with '#' will be ignored, and dashes are ignored.",
  "foo": ["https://destination.com", "owner"],
  "bar": ["https://another-destination.com"]
}
```

Hit `Ctrl-G` to open the extension, paste the URL to that JSON
file, and click on "Update now".

![](img/set_json.png)

# Usage

Hit `Ctrl-G` and type a few letters. Hit `Enter` to go to the first result,
or click on one of the results in the list.

# Suggested setup for teams / companies

What I've found works best is to use GitHub for this purpose.

* Set up a specific repository to store the JSON file. Use a branch called
  `gh-pages` so the newest version of the file is always published at a stable
  URL.
* Allow any team member to make changes without review.
* If you modify an existing link, check with the `owner` first.

<style>

  html {
    background: #ddd;
  }

  body {
    background: #fff;
    border: 1px solid #bbb;
    margin: 2ex;
    padding: 2ex;
  }

  body img {
    border: 1px solid rgba(0, 0, 0, 0.5);
    display: block;
    margin: 0 auto;
  }
</style>
