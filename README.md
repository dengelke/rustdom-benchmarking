# rustdom-benchmarking

A benchmarking suite for JSDOM, LinkeDOM and Rustdom to compare performance, uses extensive amounts of code from the [LinkedDOM benchmakring suite](https://github.com/WebReflection/linkedom/tree/main/test/benchmark)

## Installation

Installing rustdom requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support).

```sh
git clone git@github.com:dengelke/rustdom-benchmarking.git
cd rustdom-benchmarking
npm install
```

## Running suite

```sh
npm run start
```

## Running individual suites

Each DOM library can be run individually as well

```sh
npm run jsdom
npm run linkedom
npm run rustdom
```
