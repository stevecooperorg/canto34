Canto 34 is a library for building recursive-descent parsers. It can be used
both on node.js, and in the browser as an AMD module.

When it comes to writing a parser, you get two main choices. Write your own,
or use a parser generator like PEGJS or ANTLR.

I've never really had much success with parser generators, and it's always
seemed pretty easy to write a recursive-descent parser yourself, *if* you have
some basic tools like a regex-based lexer, and some basic functions for
matching tokens and reporting errors. Canto34.js gives you the functions you
need to write a regex-based lexer and a recursive descent parser yourself.

A Simple Example
-----

Here's a simple example of a language which just defines name-value pairs;

    foo 1, bar 5, baz 8.

We'll see how to parse this language. First, you write a lexer which
identifies the different kinds of token -- names, integers, commas, and
periods;

    var lexer = new canto34.Lexer();

    // add a token for whitespace
    lexer.addTokenType({ 
        name: "ws",       // give it a name
        regexp: /[ \t]+/, // match spaces and tabs
        ignore: true      // don't return this token in the result
    });
    
    // add a token type for names, defines as strings of lower-case characters
    lexer.addTokenType({ name: "name", regexp: /^[a-z]+/  });
    
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
