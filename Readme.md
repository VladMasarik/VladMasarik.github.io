# F Type

## Quick Install

In order to play the game, you need to serve the files over a http server. If you currently don't have one, here are two easy ways to launch one.


### Node

The recommanded way to play the game is to couple it with a node server. To do so, use the following commands :

```
npm install http-server -g
http-server 
```

By default a server will be lanched at [http://localhost:8080](http://localhost:8080)

### Python

To use it with Python3 simple use the command :

```
python3 -m http.server
```

By default a server will be lanched at [http://localhost:8000](http://localhost:8000)


## Quick notes

- You can change the name of the game by editing the `mainTitle` variable in Ftype.js
- To use a custom word file, simply drag and drop on the drop box in the menu and launch your game. Otherwise, a list of predefined words will be used.
- To create words, you can use the exposed function `createWord(word)` with word being the String you want to display