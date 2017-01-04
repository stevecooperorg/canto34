When it comes to writing a parser, you get two main choices. Write your own,
or use a parser generator like PEGJS or ANTLR.

I've never really had much success with parser generators, and it's always
seemed pretty easy to write a recursive-descent parser yourself, *if* you have
some basic tools like a regex-based lexer, and some basic functions for
matching tokens and reporting errors. Canto34.js gives you the functions you
need to write a regex-based lexer and a recursive descent parser yourself.

Canto 34 is a library for building recursive-descent parsers. It can be used
both on node.js, and in the browser as an AMD module. It comes in three parts;

    **canto34.js** -- basic parsing tools like lexing and parsing
    **canto34-syntax.js** -- build syntax highlighters using the tmLanguage format (Sublime Text)
    **canto34-expect.js** -- test parsers using expect.js and mocha.

canto34.js - A Simple Example
-----

Here's a simple example of a language which just defines name-value pairs;

    foo 1, bar 5, baz 8.

We'll see how to parse this language. First, you write a lexer which
identifies the different kinds of token -- names, integers, commas, and
periods;

    // note this is a es2015 module - use require() on node or if using require.js
    import * as canto34 from './canto34';

    var lexer = new canto34.Lexer({ languageName: "nameValuePairs" });

    // add a token for whitespace
    lexer.addTokenType({ 
        name: "ws",       // give it a name
        regexp: /[ \t]+/, // match spaces and tabs
        ignore: true      // don't return this token in the result
    });

    // add a token type for names, defines as strings of lower-case characters
    lexer.addTokenType({ name: "name", regexp: /^[a-z]+/ });

    // bring in some predefined types for commas, period, and integers.
    var types = canto34.StandardTokenTypes;
    lexer.addTokenType(types.comma());
    lexer.addTokenType(types.period());
    lexer.addTokenType(types.integer());

And here's how you use it;

    var tokens = lexer.tokenize("foo 1, bar 2.");
    
which returns a set of tokens;

    [
        { content: "foo", type: "name",    line: 1, character: 1 },
        { content: 1,     type: "integer", line: 1, character: 5 },
        { content: ",",   type: "comma",   line: 1, character: 6 },
        { content: "bar", type: "name",    line: 1, character: 8 },
        { content: 2,     type: "integer", line: 1, character: 12 },
        { content: ".",   type: "period",  line: 1, character: 13 }
    ]

Now you feed these tokens into a parser. Here's a parser for our language;

    var parser = new canto34.Parser();
    parser.listOfNameValuePairs = function() {
        this.result = [];
        this.nameValuePair();
        while (!this.eof() && this.la1("comma")) {
            this.match("comma");
            this.nameValuePair();
        }
        this.match("period");
    };
    
    parser.nameValuePair = function() {
        var name = this.match("name").content;
        var value = this.match("integer").content;
        this.result.push({ name:name, value: value });
    };

And it's used like this;

    var tokens = lexer.tokenize("foo 1, bar 2, baz 3.");
    parser.initialize(tokens);
    parser.listOfNameValuePairs();

`parser.result` now contains the value;

    [
        {name:"foo", value:1},
        {name:"bar", value:2},
        {name:"baz", value:3},
    ]

And we're done! That's a basic lexer and parser, written in thirty lines of
code.

What's canto34.js good for?
-----

Canto 34 is designed for quickly writing parsers for straightforward domain-
specific languages (DSLs). Please don't use it for writing parsers for
general-purpose programming languages -- it's not designed to be that fast or
powerful.

Extras - syntax highlighting and tdd with expect.js
=====

Right now, if you get the source code from [github](https://github.com/stevecooperorg/canto34), or you install via npm and look in `node_modules/canto34/dist`, you'll find two other modules. I'll endeavor to upload them to npm soon.

canto34-syntax.js - tmLanguage / Sublime Text Syntax Highlighting
-----
Starting in v0.0.5, I've added a function to let you generate a `.tmLanguage` file. This is the syntax highlighting system of TextMate, Sublime Text, Atom, and Visual Studio code. 

This is actually pretty sweet; it makes your language feel a bit more 'first class' when you get the richer IDE experience.

First, you'll need to configure the tokens in your lexer a bit more. For example, if you have a variable name token, you'll need to tell the lexer that this should be highlighted one way, and if you have a keyword like 'for', you'll use another. Do this with the `roles` option on a token type;

    lexer.addTokenType({ name: "comment", ignore: true, regexp: /^#.*/, role: ["comment", "line"] });
    lexer.addTokenType(types.constant("for","for", ["keyword"]));
    lexer.addTokenType(types.constant("[", "openSquare", ["punctuation"]));
    lexer.addTokenType(types.constant("]", "closeSquare", ["punctuation"]));

The list of roles isn't clear to me - I've just figured out some key ones like `keyword`, `comment`, and `punctuation` from reverse engineering existing `tmLanguage` files.

Then generate the file content using the `canto34-syntax` module, and save it wherever your text editor demands. For example, To use it with Sublime Text 3 on windows, call code like so, swapping `{myusername}` with the name of your user account;

    import { tmLanguage } from './canto34-syntax';
    import { lexer } from './my-parser'; // assuming that's where you've saved your lexer!

    var content = tmLanguage.generateTmLanguageDefinition(lexer);

    require('fs').writeFileSync("C:\\Users\\{myusername}\\AppData\\Roaming\\Sublime Text 3\\Packages\\User\\myparser.tmLanguage", content);

This will write out a syntax highlighting file into your User folder, which is a personal 'dumping ground' for configuration bits and pieces on your machine for Sublime Text. When you restart ST, you'll see your language in the list of language options, displayed in the bottom-right.

canto34-expect.js - testing your lexer and parser
---

If you want to test your lexer, it's worth having a few extra matching methods. You can extend `expect.js` like so in your mocha tests;

    import { expectMatchers } from '../src/canto34-expect';
    import expect, { createSpy, spyOn, isSpy } from 'expect';
    expect.extend(canto34.expectMatchers);

This adds a host of `to*()` methods, for example;

    expect([
			{ content: "x", type:"y", line:1, character:1},
			{ content: "a", type:"b", line:1, character:2}
		]).toHaveTokenTypes(["y", "b"]);

Check out `canto34-expect.spec.js` to see some examples, but basically;

- `toHaveTokenTypes(expected)` -- the array of tokens has particular types. So you can say things like `expect(lexer.tokenize("int x = 1")).toHaveTokenTypes(['type', 'identifier', 'equals', 'number']);
- `toHaveTokenContent(expected)` -- the array of tokens has particular content. So you can say things like `expect(lexer.tokenize("int x = 1")).toHaveTokenTypes(['int', 'x', '=', '1']);
- `toBeAt(line, character)` -- the token is at a particular position in the input file. So you can say things like `expect(lexer.tokenize("int x = 1")[1]).toToBeAt(1,5);