---
slug: introducing-magiclogger
title: Introducing MagicLogger
date: 2025-09-11
authors: [manic]
tags: [magiclogger, logging, developer-tools, open-source]
image: /img/magiclogger-primary-white-4x.png
description: MagicLogger transforms your logging experience into a visually rich and smooth API with automatic colors, tables, and structured formatting that makes debugging enjoyable.
---

![MagicLogger Logo](/img/magiclogger-primary-white-4x.png)

## Why We Built MagicLogger

Logging is one of those fundamental things every developer does, yet most logging libraries treat visual output as an afterthought. We wanted something that makes debugging feel less like archaeology and more like reading a well designed dashboard.

## The Problem with Traditional Logging

Have you ever stared at thousands of lines of monochrome logs trying to find that one error? Or struggled to make sense of JSON blobs that stretch across your terminal? We have too.

Traditional logging libraries focus on performance and features but forget about the human on the other side of the screen. They dump data efficiently but leave you to figure out what it all means.

<!-- truncate -->

## Our Vision: Logging That's Actually Readable

MagicLog will maintain the open-source MAGIC schema and Magic dashboard. 

With clear visual hierarchies and stunning colors, tables, progress bars, and structured formatting, your logs become instantly scannable and actually parsable by humans, even at scale.

We didn't stop at making things pretty. MagicLogger is built for production:

- **Performant and fast**: 164K ops/sec plain text, 120K ops/sec with full styling
- **Async by default**: Non blocking operations that won't slow your app
- **Universal compatibility**: Works everywhere JavaScript runs, in browser, Node
- **Production ready**: Built in rate limiting, sampling, and error handling

## The MAGIC Schema

Our secret sauce is the MAGIC schema, a universal format that preserves styling across all transports. Whether your logs go to the console, a file, or a remote service, they maintain their visual structure and formatting, exportable / ingestible by any language.

## Get Started Today

MagicLogger is open source and ready to use:

```bash
npm install magiclogger
```

```javascript
import { Logger } from 'magiclogger';

const logger = new Logger();
logger.info('Welcome to beautiful logging');
```

Join us in making developer tools that developers actually love using.

---

Built by [Manic Agency](https://manic.agency). We create tools that make development more human.