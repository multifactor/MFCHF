[![MFCHF](https://raw.githubusercontent.com/multifactor/MFCHF/master/site/logo.png "MFCHF")](https://mfchf.com/ "MFCHF")

Multi-Factor Credential Hashing Function

[![GitHub issues](https://img.shields.io/github/issues/multifactor/MFCHF)](https://github.com/multifactor/MFCHF/issues)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://www.mfchf.com/coverage)
[![Tests](https://img.shields.io/badge/tests-100%25-brightgreen)](https://www.mfchf.com/tests/mochawesome.html)
[![CC BY-NC-SA 4.0](https://img.shields.io/badge/license-BSD--3--Clause--Clear%204.0-brightgreen.svg)](https://github.com/multifactor/MFCHF/blob/master/LICENSE)
[![GitHub tag](https://img.shields.io/github/tag/multifactor/MFCHF.svg)](https://github.com/multifactor/MFCHF/tags)
[![GitHub release](https://img.shields.io/github/release/multifactor/MFCHF.svg)](https://github.com/multifactor/MFCHF/releases)
[![NPM release](https://img.shields.io/npm/v/mfchf.svg)](https://www.npmjs.com/package/mfchf)

[Site](https://mfchf.com/) |
[Docs](https://mfchf.com/docs/) |
[Contributing](https://github.com/multifactor/MFCHF/blob/master/CONTRIBUTING.md) |
[Security](https://github.com/multifactor/MFCHF/blob/master/SECURITY.md) |
[Multifactor](https://github.com/multifactor) |
[Paper](https://ieeexplore.ieee.org/document/10190544) |
[Author](https://github.com/VCNinc)

Since the introduction of bcrypt in 1999, adaptive password hashing functions, whereby brute-force resistance increases symmetrically with computational difficulty for legitimate users, have been our most powerful post-breach countermeasure against credential disclosure. Unfortunately, the relatively low tolerance of users to added latency places an upper bound on the deployment of this technique in most applications. In this paper, we present a multi-factor credential hashing function (MFCHF) that incorporates the additional entropy of multi-factor authentication into password hashes to provide asymmetric resistance to brute-force attacks. MFCHF provides full backward compatibility with existing authentication software (e.g., Google Authenticator) and hardware (e.g., YubiKeys), with support for common usability features like factor recovery. The result is a 10 6 to 10 48 times increase in the difficulty of cracking hashed credentials, with little added latency or usability impact.

# Getting Started
## Download MFCHF.js
There are three ways to add `mfchf.js` to your project: self-hosted, using a CDN, or using NPM (recommended).

### Option 1: Self-Hosted
First download the [latest release on GitHub](https://github.com/multifactor/MFCHF/releases), then add `mfchf.js` or `mfchf.min.js` to your page like so:

	<script src="mfchf.min.js"></script>

### Option 2: CDN
You can automatically include the latest version of `mfchf.min.js` in your page like so:

	<script src="https://cdn.jsdelivr.net/gh/multifactor/mfchf/mfchf.min.js"></script>

Note that this may automatically update to include breaking changes in the future. Therefore, it is recommended that you get the latest single-version tag with SRI from [jsDelivr](https://www.jsdelivr.com/package/npm/mfchf) instead.

### Option 3: NPM (recommended)
Add MFCHF to your NPM project:

	npm install mfchf


Require MFCHF like so:

	const mfchf = require('mfchf');

Copyright ©2023 Multifactor • [BSD-3-Clause-Clear](https://github.com/multifactor/MFCHF/blob/master/LICENSE)
