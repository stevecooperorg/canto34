Canto 34 is a library for building recursive-descent parsers.

When it comes to writing a parser, you get two main choices. Write your own,
or use a parser generator like PEGJS or ANTLR.

I've never really had much success with parser generators, and it's always
seemed pretty easy to write a recursive-descent parser yourself, *if* you have
some basic tools like a regex-based lexer, and some basic functions for
matching tokens and reporting errors. Canto34 gives you the functions you need
to write a recursive descent parser yourself.

At the moment, Canto34 is intended for a small set of scenarios;

- You know all of the content you want to parse; that is, you have a string which contains your whole script.