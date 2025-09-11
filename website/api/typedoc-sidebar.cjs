// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "async",
      items: [
        {
          type: "category",
          label: "AsyncLogger",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLogger/classes/AsyncLogger",
                  label: "AsyncLogger"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLogger/interfaces/AsyncLoggerOptions",
                  label: "AsyncLoggerOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLogger/functions/createAsyncLogger",
                  label: "createAsyncLogger"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/async/AsyncLogger/index"
          }
        },
        {
          type: "category",
          label: "AsyncLoggerWorker",
          items: [
            {
              type: "category",
              label: "Enumerations",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLoggerWorker/enumerations/MessageType",
                  label: "MessageType"
                }
              ]
            },
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLoggerWorker/classes/WorkerState",
                  label: "WorkerState"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLoggerWorker/interfaces/WorkerConfig",
                  label: "WorkerConfig"
                },
                {
                  type: "doc",
                  id: "../website/api/async/AsyncLoggerWorker/interfaces/WorkerMetrics",
                  label: "WorkerMetrics"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/async/AsyncLoggerWorker/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "colors",
      items: [
        {
          type: "category",
          label: "CustomColorRegistry",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/colors/CustomColorRegistry/classes/CustomColorRegistry",
                  label: "CustomColorRegistry"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/colors/CustomColorRegistry/interfaces/CustomColorDefinition",
                  label: "CustomColorDefinition"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/colors/CustomColorRegistry/functions/getCustomColorRegistry",
                  label: "getCustomColorRegistry"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/colors/CustomColorRegistry/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "constants",
      items: [
        {
          type: "category",
          label: "ansi",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/ansi/variables/ANSI",
                  label: "ANSI"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/constants/ansi/index"
          }
        },
        {
          type: "category",
          label: "colors",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/colors/variables/ANSI_CODES",
                  label: "ANSI_CODES"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/colors/variables/COLORS",
                  label: "COLORS"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/colors/variables/RESET_CODES",
                  label: "RESET_CODES"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/colors/variables/STATIC_COLORS",
                  label: "STATIC_COLORS"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/constants/colors/index"
          }
        },
        {
          type: "category",
          label: "paths",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/paths/variables/CODE_FILE_EXTENSIONS",
                  label: "CODE_FILE_EXTENSIONS"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/paths/variables/CODE_FILE_EXTENSIONS_ARRAY",
                  label: "CODE_FILE_EXTENSIONS_ARRAY"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/paths/variables/IS_PATH_REGEX",
                  label: "IS_PATH_REGEX"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/paths/variables/PATH_REGEX",
                  label: "PATH_REGEX"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/paths/variables/PATH_REGEX_ELEMENTS",
                  label: "PATH_REGEX_ELEMENTS"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/constants/paths/index"
          }
        },
        {
          type: "category",
          label: "preset",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/preset/variables/EXTENDED_PRESETS",
                  label: "EXTENDED_PRESETS"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/variables/PRESETS",
                  label: "PRESETS"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/variables/PRESETS_COMPAT",
                  label: "PRESETS_COMPAT"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/preset/functions/getAllPresets",
                  label: "getAllPresets"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/functions/getPreset",
                  label: "getPreset"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/functions/getPresetColors",
                  label: "getPresetColors"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/functions/getPresetNames",
                  label: "getPresetNames"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/preset/functions/hasPreset",
                  label: "hasPreset"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/constants/preset/index"
          }
        },
        {
          type: "category",
          label: "themes",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/constants/themes/variables/DARK_THEME",
                  label: "DARK_THEME"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/themes/variables/DEFAULT_THEME",
                  label: "DEFAULT_THEME"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/themes/variables/LIGHT_THEME",
                  label: "LIGHT_THEME"
                },
                {
                  type: "doc",
                  id: "../website/api/constants/themes/variables/MINIMAL_THEME",
                  label: "MINIMAL_THEME"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/constants/themes/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/constants/index"
      }
    },
    {
      type: "category",
      label: "core",
      items: [
        {
          type: "category",
          label: "BrowserLogger",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/BrowserLogger/classes/BrowserLogger",
                  label: "BrowserLogger"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/BrowserLogger/index"
          }
        },
        {
          type: "category",
          label: "BrowserStorageManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/BrowserStorageManager/classes/BrowserStorageManager",
                  label: "BrowserStorageManager"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/BrowserStorageManager/index"
          }
        },
        {
          type: "category",
          label: "Colorizer",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/Colorizer/classes/Colorizer",
                  label: "Colorizer"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/Colorizer/index"
          }
        },
        {
          type: "category",
          label: "ContextManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/classes/ContextManager",
                  label: "ContextManager"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/interfaces/ContextManagerOptions",
                  label: "ContextManagerOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/interfaces/ContextSnapshot",
                  label: "ContextSnapshot"
                },
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/interfaces/ContextValidationResult",
                  label: "ContextValidationResult"
                },
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/interfaces/ContextValidationRules",
                  label: "ContextValidationRules"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/ContextManager/type-aliases/SanitizeMode",
                  label: "SanitizeMode"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/ContextManager/index"
          }
        },
        {
          type: "category",
          label: "events-compat",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/events-compat/variables/Emitter",
                  label: "Emitter"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/events-compat/index"
          }
        },
        {
          type: "category",
          label: "FileManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/FileManager/classes/FileManager",
                  label: "FileManager"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/FileManager/index"
          }
        },
        {
          type: "category",
          label: "Formatter",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/Formatter/classes/Formatter",
                  label: "Formatter"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/Formatter/index"
          }
        },
        {
          type: "category",
          label: "LoggerBase",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/LoggerBase/classes/LoggerBase",
                  label: "LoggerBase"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/LoggerBase/index"
          }
        },
        {
          type: "category",
          label: "NodeLogger",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/NodeLogger/classes/NodeLogger",
                  label: "NodeLogger"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/NodeLogger/index"
          }
        },
        {
          type: "category",
          label: "Printer",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/Printer/classes/Printer",
                  label: "Printer"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/Printer/interfaces/PrinterOptions",
                  label: "PrinterOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/Printer/index"
          }
        },
        {
          type: "category",
          label: "StyleBuilder",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/StyleBuilder/classes/StyleBuilder",
                  label: "StyleBuilder"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/StyleBuilder/index"
          }
        },
        {
          type: "category",
          label: "TagManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/classes/TagManager",
                  label: "TagManager"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagExtractionOptions",
                  label: "TagExtractionOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagFilterOptions",
                  label: "TagFilterOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagManagerOptions",
                  label: "TagManagerOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagMatchCriteria",
                  label: "TagMatchCriteria"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagNormalizationRules",
                  label: "TagNormalizationRules"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagStats",
                  label: "TagStats"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagValidationResult",
                  label: "TagValidationResult"
                },
                {
                  type: "doc",
                  id: "../website/api/core/TagManager/interfaces/TagValidationRules",
                  label: "TagValidationRules"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/core/TagManager/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/core/index"
      }
    },
    {
      type: "category",
      label: "extensions",
      items: [
        {
          type: "category",
          label: "QueueManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/QueueManager/classes/QueueManager",
                  label: "QueueManager"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/QueueManager/interfaces/QueueManagerOptions",
                  label: "QueueManagerOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/extensions/QueueManager/interfaces/QueueStats",
                  label: "QueueStats"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/QueueManager/type-aliases/DropPolicy",
                  label: "DropPolicy"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/extensions/QueueManager/index"
          }
        },
        {
          type: "category",
          label: "RateLimiter",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/RateLimiter/classes/RateLimiter",
                  label: "RateLimiter"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/RateLimiter/interfaces/RateLimiterOptions",
                  label: "RateLimiterOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/RateLimiter/type-aliases/RateLimitStrategy",
                  label: "RateLimitStrategy"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/extensions/RateLimiter/index"
          }
        },
        {
          type: "category",
          label: "Redactor",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/classes/Redactor",
                  label: "Redactor"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/interfaces/RedactionPattern",
                  label: "RedactionPattern"
                },
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/interfaces/RedactorOptions",
                  label: "RedactorOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/type-aliases/RedactionPreset",
                  label: "RedactionPreset"
                },
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/type-aliases/RedactionStrategy",
                  label: "RedactionStrategy"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Redactor/functions/createRedactorPreset",
                  label: "createRedactorPreset"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/extensions/Redactor/index"
          }
        },
        {
          type: "category",
          label: "Sampler",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Sampler/classes/Sampler",
                  label: "Sampler"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Sampler/interfaces/SamplerOptions",
                  label: "SamplerOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Sampler/type-aliases/SamplingStrategy",
                  label: "SamplingStrategy"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/extensions/Sampler/functions/createSamplerPreset",
                  label: "createSamplerPreset"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/extensions/Sampler/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/extensions/index"
      }
    },
    {
      type: "category",
      label: "index.browser",
      items: [
        {
          type: "category",
          label: "Classes",
          items: [
            {
              type: "doc",
              id: "../website/api/index.browser/classes/Logger",
              label: "Logger"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/index.browser/index"
      }
    },
    {
      type: "category",
      label: "Logger",
      items: [
        {
          type: "category",
          label: "Classes",
          items: [
            {
              type: "doc",
              id: "../website/api/Logger/classes/Logger",
              label: "Logger"
            }
          ]
        },
        {
          type: "category",
          label: "Type Aliases",
          items: [
            {
              type: "doc",
              id: "../website/api/Logger/type-aliases/IdGenerator",
              label: "IdGenerator"
            },
            {
              type: "doc",
              id: "../website/api/Logger/type-aliases/LogEntryMeta",
              label: "LogEntryMeta"
            },
            {
              type: "doc",
              id: "../website/api/Logger/type-aliases/LogMetadata",
              label: "LogMetadata"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/Logger/index"
      }
    },
    {
      type: "category",
      label: "magiclogger",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/createAsyncLogger",
              label: "createAsyncLogger"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/createLogger",
              label: "createLogger"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/createSyncLogger",
              label: "createSyncLogger",
              className: "typedoc-sidebar-item-deprecated"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/default",
              label: "default"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/getDefaultLogger",
              label: "getDefaultLogger"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/isAsyncLogger",
              label: "isAsyncLogger"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/isSyncLogger",
              label: "isSyncLogger"
            },
            {
              type: "doc",
              id: "../website/api/magiclogger/functions/setDefaultLogger",
              label: "setDefaultLogger"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/magiclogger/index"
      }
    },
    {
      type: "category",
      label: "middleware",
      items: [
        {
          type: "category",
          label: "Middleware",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/Middleware/classes/AsyncMiddleware",
                  label: "AsyncMiddleware"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/Middleware/classes/Middleware",
                  label: "Middleware"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/Middleware/classes/MiddlewarePipeline",
                  label: "MiddlewarePipeline"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/Middleware/interfaces/MiddlewareContext",
                  label: "MiddlewareContext"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/Middleware/interfaces/MiddlewareResult",
                  label: "MiddlewareResult"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/middleware/Middleware/index"
          }
        },
        {
          type: "category",
          label: "ObservabilityMiddleware",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/classes/ObservabilityMiddleware",
                  label: "ObservabilityMiddleware"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/interfaces/LogMetrics",
                  label: "LogMetrics"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/interfaces/MetricsCollector",
                  label: "MetricsCollector"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/interfaces/ObservabilityMiddlewareOptions",
                  label: "ObservabilityMiddlewareOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/interfaces/TraceContext",
                  label: "TraceContext"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/ObservabilityMiddleware/functions/createOTLPObservability",
                  label: "createOTLPObservability"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/middleware/ObservabilityMiddleware/index"
          }
        },
        {
          type: "category",
          label: "SecurityMiddleware",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/SecurityMiddleware/classes/SecurityMiddleware",
                  label: "SecurityMiddleware"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/SecurityMiddleware/interfaces/SecurityMiddlewareOptions",
                  label: "SecurityMiddlewareOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/middleware/SecurityMiddleware/index"
          }
        },
        {
          type: "category",
          label: "TraceContextMiddleware",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/TraceContextMiddleware/classes/TraceContextMiddleware",
                  label: "TraceContextMiddleware"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/TraceContextMiddleware/interfaces/TraceContextMiddlewareOptions",
                  label: "TraceContextMiddlewareOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/middleware/TraceContextMiddleware/functions/createExpressTraceMiddleware",
                  label: "createExpressTraceMiddleware"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/TraceContextMiddleware/functions/createFastifyTraceMiddleware",
                  label: "createFastifyTraceMiddleware"
                },
                {
                  type: "doc",
                  id: "../website/api/middleware/TraceContextMiddleware/functions/createKoaTraceMiddleware",
                  label: "createKoaTraceMiddleware"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/middleware/TraceContextMiddleware/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/middleware/index"
      }
    },
    {
      type: "category",
      label: "parsers",
      items: [
        {
          type: "category",
          label: "TemplateParser",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/parsers/TemplateParser/classes/TemplateParser",
                  label: "TemplateParser"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/parsers/TemplateParser/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "sync",
      items: [
        {
          type: "category",
          label: "SyncLogger",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/sync/SyncLogger/classes/SyncLogger",
                  label: "SyncLogger"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/sync/SyncLogger/functions/createSyncLogger",
                  label: "createSyncLogger"
                },
                {
                  type: "doc",
                  id: "../website/api/sync/SyncLogger/functions/isSyncLogger",
                  label: "isSyncLogger"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/sync/SyncLogger/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "theme",
      items: [
        {
          type: "category",
          label: "Variables",
          items: [
            {
              type: "doc",
              id: "../website/api/theme/variables/getTheme",
              label: "getTheme"
            },
            {
              type: "doc",
              id: "../website/api/theme/variables/listThemes",
              label: "listThemes"
            },
            {
              type: "doc",
              id: "../website/api/theme/variables/loadThemes",
              label: "loadThemes"
            }
          ]
        },
        {
          type: "category",
          label: "loader",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/theme/loader/functions/getTheme",
                  label: "getTheme"
                },
                {
                  type: "doc",
                  id: "../website/api/theme/loader/functions/listThemes",
                  label: "listThemes"
                },
                {
                  type: "doc",
                  id: "../website/api/theme/loader/functions/loadThemes",
                  label: "loadThemes"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/theme/loader/index"
          }
        },
        {
          type: "category",
          label: "loader.browser",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/theme/loader.browser/functions/getTheme",
                  label: "getTheme"
                },
                {
                  type: "doc",
                  id: "../website/api/theme/loader.browser/functions/listThemes",
                  label: "listThemes"
                },
                {
                  type: "doc",
                  id: "../website/api/theme/loader.browser/functions/loadThemes",
                  label: "loadThemes"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/theme/loader.browser/index"
          }
        },
        {
          type: "category",
          label: "ThemeManager",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/theme/ThemeManager/classes/ThemeManager",
                  label: "ThemeManager"
                }
              ]
            },
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/theme/ThemeManager/variables/DEFAULT_THEME",
                  label: "DEFAULT_THEME"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/theme/ThemeManager/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/theme/index"
      }
    },
    {
      type: "category",
      label: "theme",
      items: [
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../website/api/theme/functions/createThemeManager",
              label: "createThemeManager"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/theme/index-1"
      }
    },
    {
      type: "doc",
      id: "../website/api/theme/index-2",
      label: "theme"
    },
    {
      type: "category",
      label: "transports",
      items: [
        {
          type: "category",
          label: "Classes",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/classes/TransportRegistry",
              label: "TransportRegistry"
            }
          ]
        },
        {
          type: "category",
          label: "Type Aliases",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/type-aliases/TransportFactory",
              label: "TransportFactory"
            }
          ]
        },
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/functions/createDefaultTransportManager",
              label: "createDefaultTransportManager"
            }
          ]
        },
        {
          type: "category",
          label: "AsyncFileTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/AsyncFileTransport/classes/AsyncFileTransport",
                  label: "AsyncFileTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/AsyncFileTransport/interfaces/AsyncFileTransportOptions",
                  label: "AsyncFileTransportOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/AsyncFileTransport/index"
          }
        },
        {
          type: "category",
          label: "base",
          items: [
            {
              type: "category",
              label: "BatchingTransport",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/base/BatchingTransport/classes/BatchingTransport",
                      label: "BatchingTransport"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/base/BatchingTransport/index"
              }
            },
            {
              type: "category",
              label: "implementations",
              items: [
                {
                  type: "category",
                  label: "ConsoleTransport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/ConsoleTransport/classes/ConsoleTransport",
                          label: "ConsoleTransport"
                        }
                      ]
                    },
                    {
                      type: "category",
                      label: "Interfaces",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/ConsoleTransport/interfaces/ConsoleTransportOptions",
                          label: "ConsoleTransportOptions"
                        }
                      ]
                    },
                    {
                      type: "category",
                      label: "Functions",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/ConsoleTransport/functions/createConsoleTransport",
                          label: "createConsoleTransport"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/ConsoleTransport/index"
                  }
                },
                {
                  type: "category",
                  label: "MongoDBTransport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/MongoDBTransport/classes/MongoDBTransport",
                          label: "MongoDBTransport"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/MongoDBTransport/index"
                  }
                },
                {
                  type: "category",
                  label: "OTLPTransport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/OTLPTransport/classes/OTLPTransport",
                          label: "OTLPTransport"
                        }
                      ]
                    },
                    {
                      type: "category",
                      label: "Interfaces",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/OTLPTransport/interfaces/OTLPTransportOptions",
                          label: "OTLPTransportOptions"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/OTLPTransport/index"
                  }
                },
                {
                  type: "category",
                  label: "S3Transport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/S3Transport/classes/S3Transport",
                          label: "S3Transport"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/S3Transport/index"
                  }
                },
                {
                  type: "category",
                  label: "StreamTransport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/StreamTransport/classes/StreamTransport",
                          label: "StreamTransport"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/StreamTransport/index"
                  }
                },
                {
                  type: "category",
                  label: "WebSocketTransport",
                  items: [
                    {
                      type: "category",
                      label: "Classes",
                      items: [
                        {
                          type: "doc",
                          id: "../website/api/transports/base/implementations/WebSocketTransport/classes/WebSocketTransport",
                          label: "WebSocketTransport"
                        }
                      ]
                    }
                  ],
                  link: {
                    type: "doc",
                    id: "../website/api/transports/base/implementations/WebSocketTransport/index"
                  }
                }
              ]
            },
            {
              type: "category",
              label: "TransportManager",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/base/TransportManager/classes/TransportManager",
                      label: "TransportManager"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/base/TransportManager/index"
              }
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/base/index"
          }
        },
        {
          type: "category",
          label: "base",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/base/classes/NetworkTransport",
                  label: "NetworkTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/base/index-1"
          }
        },
        {
          type: "category",
          label: "base",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/base/classes/Transport",
                  label: "Transport"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/base/functions/hasStats",
                  label: "hasStats"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/base/functions/isAsyncTransport",
                  label: "isAsyncTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/base/functions/isBatchingTransport",
                  label: "isBatchingTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/base/index-2"
          }
        },
        {
          type: "doc",
          id: "../website/api/transports/base/index-3",
          label: "base"
        },
        {
          type: "category",
          label: "console",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/console/functions/createConsoleTransport",
                  label: "createConsoleTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/console/index"
          }
        },
        {
          type: "category",
          label: "file",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/file/variables/createFile",
                  label: "createFile"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/file/functions/createFileTransport",
                  label: "createFileTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/file/index"
          }
        },
        {
          type: "category",
          label: "FileTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/FileTransport/classes/FileTransport",
                  label: "FileTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/FileTransport/interfaces/FileTransportOptions",
                  label: "FileTransportOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/FileTransport/index"
          }
        },
        {
          type: "category",
          label: "formatters",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/formatters/classes/CSVFormatter",
                  label: "CSVFormatter"
                }
              ]
            },
            {
              type: "category",
              label: "BaseFormatter",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/BaseFormatter/classes/CustomFormatter",
                      label: "CustomFormatter"
                    },
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/BaseFormatter/classes/FunctionFormatter",
                      label: "FunctionFormatter"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Interfaces",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/BaseFormatter/interfaces/ICustomFormatter",
                      label: "ICustomFormatter"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/formatters/BaseFormatter/index"
              }
            },
            {
              type: "category",
              label: "CustomFormatter",
              items: [
                {
                  type: "category",
                  label: "Variables",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/CustomFormatter/variables/LEGACY_CUSTOM_FORMATTER_FILE",
                      label: "LEGACY_CUSTOM_FORMATTER_FILE"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/formatters/CustomFormatter/index"
              }
            },
            {
              type: "category",
              label: "JSONFormatter",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/JSONFormatter/classes/JSONFormatter",
                      label: "JSONFormatter"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Interfaces",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/JSONFormatter/interfaces/JSONFormatterOptions",
                      label: "JSONFormatterOptions"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Variables",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/JSONFormatter/variables/JSONFormatters",
                      label: "JSONFormatters"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/formatters/JSONFormatter/index"
              }
            },
            {
              type: "category",
              label: "PlainTextFormatter",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/PlainTextFormatter/classes/PlainTextFormatter",
                      label: "PlainTextFormatter"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Interfaces",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/PlainTextFormatter/interfaces/PlainTextFormatterOptions",
                      label: "PlainTextFormatterOptions"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Variables",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/PlainTextFormatter/variables/PlainTextFormatters",
                      label: "PlainTextFormatters"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/formatters/PlainTextFormatter/index"
              }
            },
            {
              type: "category",
              label: "XMLFormatter",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/formatters/XMLFormatter/classes/XMLFormatter",
                      label: "XMLFormatter"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/formatters/XMLFormatter/index"
              }
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/formatters/index"
          }
        },
        {
          type: "category",
          label: "http",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/http/variables/createHTTP",
                  label: "createHTTP"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/http/functions/createHTTPTransport",
                  label: "createHTTPTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/http/index"
          }
        },
        {
          type: "category",
          label: "HTTPTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/HTTPTransport/classes/HTTPTransport",
                  label: "HTTPTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/HTTPTransport/interfaces/HTTPTransportOptions",
                  label: "HTTPTransportOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/HTTPTransport/index"
          }
        },
        {
          type: "doc",
          id: "../website/api/transports/mongodb/index",
          label: "mongodb"
        },
        {
          type: "category",
          label: "null",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/null/classes/NullTransport",
                  label: "NullTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/null/index"
          }
        },
        {
          type: "category",
          label: "null",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/null/classes/NullTransport-1",
                  label: "NullTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/null/index-1"
          }
        },
        {
          type: "category",
          label: "otlp",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createDatadogTransport",
                  label: "createDatadogTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createElasticAPMTransport",
                  label: "createElasticAPMTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createGoogleCloudTransport",
                  label: "createGoogleCloudTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createGrafanaCloudTransport",
                  label: "createGrafanaCloudTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createHoneycombTransport",
                  label: "createHoneycombTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createJaegerTransport",
                  label: "createJaegerTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createNewRelicTransport",
                  label: "createNewRelicTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createOTLPTransport",
                  label: "createOTLPTransport"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/otlp/functions/createXRayTransport",
                  label: "createXRayTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/otlp/index"
          }
        },
        {
          type: "category",
          label: "postgresql",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/postgresql/classes/PostgreSQLTransport",
                  label: "PostgreSQLTransport"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/postgresql/index"
          }
        },
        {
          type: "doc",
          id: "../website/api/transports/postgresql/index-1",
          label: "postgresql"
        },
        {
          type: "doc",
          id: "../website/api/transports/s3/index",
          label: "s3"
        },
        {
          type: "doc",
          id: "../website/api/transports/stream/index",
          label: "stream"
        },
        {
          type: "category",
          label: "SyncConsoleTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/SyncConsoleTransport/classes/SyncConsoleTransport",
                  label: "SyncConsoleTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/SyncConsoleTransport/interfaces/SyncConsoleTransportOptions",
                  label: "SyncConsoleTransportOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/SyncConsoleTransport/index"
          }
        },
        {
          type: "category",
          label: "SyncFileTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/SyncFileTransport/classes/SyncFileTransport",
                  label: "SyncFileTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/SyncFileTransport/interfaces/SyncFileTransportOptions",
                  label: "SyncFileTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/transports/SyncFileTransport/interfaces/SyncFileTransportStats",
                  label: "SyncFileTransportStats"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/SyncFileTransport/index"
          }
        },
        {
          type: "doc",
          id: "../website/api/transports/websocket/index",
          label: "websocket"
        },
        {
          type: "category",
          label: "worker",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/worker/FileWorker/index",
              label: "FileWorker"
            },
            {
              type: "category",
              label: "FileWorkerTransport",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/worker/FileWorkerTransport/classes/FileWorkerTransport",
                      label: "FileWorkerTransport"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Interfaces",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/worker/FileWorkerTransport/interfaces/FileWorkerTransportOptions",
                      label: "FileWorkerTransportOptions"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/worker/FileWorkerTransport/index"
              }
            },
            {
              type: "category",
              label: "WorkerTransport",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/worker/WorkerTransport/classes/WorkerTransport",
                      label: "WorkerTransport"
                    }
                  ]
                },
                {
                  type: "category",
                  label: "Functions",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/transports/worker/WorkerTransport/functions/createWorkerTransport",
                      label: "createWorkerTransport"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/transports/worker/WorkerTransport/index"
              }
            }
          ]
        },
        {
          type: "category",
          label: "WorkerTransport",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/WorkerTransport/classes/WorkerTransport",
                  label: "WorkerTransport"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/WorkerTransport/interfaces/WorkerTransportOptions",
                  label: "WorkerTransportOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/transports/WorkerTransport/functions/workerHandler",
                  label: "workerHandler"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/transports/WorkerTransport/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/transports/index"
      }
    },
    {
      type: "category",
      label: "transports",
      items: [
        {
          type: "category",
          label: "Classes",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/classes/BatchingTransport",
              label: "BatchingTransport"
            },
            {
              type: "doc",
              id: "../website/api/transports/classes/NetworkTransport",
              label: "NetworkTransport"
            }
          ]
        },
        {
          type: "category",
          label: "Functions",
          items: [
            {
              type: "doc",
              id: "../website/api/transports/functions/createConsole",
              label: "createConsole"
            },
            {
              type: "doc",
              id: "../website/api/transports/functions/createFile",
              label: "createFile"
            },
            {
              type: "doc",
              id: "../website/api/transports/functions/createHTTP",
              label: "createHTTP"
            },
            {
              type: "doc",
              id: "../website/api/transports/functions/createStream",
              label: "createStream"
            }
          ]
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/transports/index-1"
      }
    },
    {
      type: "category",
      label: "types",
      items: [
        {
          type: "category",
          label: "Interfaces",
          items: [
            {
              type: "doc",
              id: "../website/api/types/interfaces/AsyncOptions",
              label: "AsyncOptions"
            },
            {
              type: "doc",
              id: "../website/api/types/interfaces/ContextMinificationOptions",
              label: "ContextMinificationOptions"
            }
          ]
        },
        {
          type: "category",
          label: "aws-sdk",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/classes/DeleteObjectsCommand",
                  label: "DeleteObjectsCommand"
                },
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/classes/HeadBucketCommand",
                  label: "HeadBucketCommand"
                },
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/classes/ListObjectsV2Command",
                  label: "ListObjectsV2Command"
                },
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/classes/PutObjectCommand",
                  label: "PutObjectCommand"
                },
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/classes/S3Client",
                  label: "S3Client"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/aws-sdk/interfaces/S3ClientConfig",
                  label: "S3ClientConfig"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/aws-sdk/index"
          }
        },
        {
          type: "category",
          label: "colors",
          items: [
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/colors/type-aliases/ColorName",
                  label: "ColorName"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/colors/index"
          }
        },
        {
          type: "category",
          label: "console",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/console/variables/consoleTypes",
                  label: "consoleTypes"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/console/index"
          }
        },
        {
          type: "category",
          label: "external",
          items: [
            {
              type: "category",
              label: "pg",
              items: [
                {
                  type: "category",
                  label: "Classes",
                  items: [
                    {
                      type: "doc",
                      id: "../website/api/types/external/pg/classes/Pool",
                      label: "Pool"
                    }
                  ]
                }
              ],
              link: {
                type: "doc",
                id: "../website/api/types/external/pg/index"
              }
            }
          ]
        },
        {
          type: "category",
          label: "logger",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/logger/interfaces/LoggerOptions",
                  label: "LoggerOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/logger/type-aliases/LogLevel",
                  label: "LogLevel"
                },
                {
                  type: "doc",
                  id: "../website/api/types/logger/type-aliases/SimpleThemeDefinition",
                  label: "SimpleThemeDefinition"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/logger/index"
          }
        },
        {
          type: "category",
          label: "mongodb",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/classes/MongoClient",
                  label: "MongoClient"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/interfaces/BulkWriteResult",
                  label: "BulkWriteResult"
                },
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/interfaces/Collection",
                  label: "Collection"
                },
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/interfaces/Db",
                  label: "Db"
                },
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/interfaces/InsertOneResult",
                  label: "InsertOneResult"
                },
                {
                  type: "doc",
                  id: "../website/api/types/mongodb/interfaces/MongoClientOptions",
                  label: "MongoClientOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/mongodb/index"
          }
        },
        {
          type: "category",
          label: "preset",
          items: [
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/preset/type-aliases/StylePreset",
                  label: "StylePreset"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/preset/index"
          }
        },
        {
          type: "category",
          label: "styling",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/BracketParseOptions",
                  label: "BracketParseOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/IStyleBuilder",
                  label: "IStyleBuilder"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/IStyledLogger",
                  label: "IStyledLogger"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/IStylingAPI",
                  label: "IStylingAPI"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/StyleOptions",
                  label: "StyleOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/StyleResult",
                  label: "StyleResult"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/StyleStats",
                  label: "StyleStats"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/StyleValidation",
                  label: "StyleValidation"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/interfaces/TemplateParseOptions",
                  label: "TemplateParseOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/StylableString",
                  label: "StylableString"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/StyledPart",
                  label: "StyledPart"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/StyleFunction",
                  label: "StyleFunction"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/StyleInput",
                  label: "StyleInput"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/StylePresetMap",
                  label: "StylePresetMap"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/TemplateFormatter",
                  label: "TemplateFormatter"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/type-aliases/WordStyleMap",
                  label: "WordStyleMap"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/styling/functions/isStyleBuilder",
                  label: "isStyleBuilder"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/functions/isStyledPart",
                  label: "isStyledPart"
                },
                {
                  type: "doc",
                  id: "../website/api/types/styling/functions/isWordStyleMap",
                  label: "isWordStyleMap"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/styling/index"
          }
        },
        {
          type: "category",
          label: "terminal",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/terminal/interfaces/TerminalSupport",
                  label: "TerminalSupport"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/terminal/type-aliases/FeatureName",
                  label: "FeatureName"
                },
                {
                  type: "doc",
                  id: "../website/api/types/terminal/type-aliases/StyleName",
                  label: "StyleName"
                },
                {
                  type: "doc",
                  id: "../website/api/types/terminal/type-aliases/TerminalProfile",
                  label: "TerminalProfile"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/terminal/index"
          }
        },
        {
          type: "category",
          label: "theme",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/theme/interfaces/ThemeConfig",
                  label: "ThemeConfig"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/theme/type-aliases/ColorStyleMap",
                  label: "ColorStyleMap"
                },
                {
                  type: "doc",
                  id: "../website/api/types/theme/type-aliases/ThemeDefinition",
                  label: "ThemeDefinition"
                },
                {
                  type: "doc",
                  id: "../website/api/types/theme/type-aliases/ThemeMap",
                  label: "ThemeMap"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/theme/index"
          }
        },
        {
          type: "category",
          label: "transport",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/AggregationStats",
                  label: "AggregationStats"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/BatchingOptions",
                  label: "BatchingOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/BatchingTransportOptions",
                  label: "BatchingTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/ConsoleTransportOptions",
                  label: "ConsoleTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/FileTransportOptions",
                  label: "FileTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/HTTPTransportOptions",
                  label: "HTTPTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/LogEntry",
                  label: "LogEntry"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/MinimalLogEntry",
                  label: "MinimalLogEntry"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/MongoDBTransportOptions",
                  label: "MongoDBTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/NetworkTransportOptions",
                  label: "NetworkTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/PostgreSQLTransportOptions",
                  label: "PostgreSQLTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/RetryOptions",
                  label: "RetryOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/S3TransportOptions",
                  label: "S3TransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/StreamTransportOptions",
                  label: "StreamTransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/Transport",
                  label: "Transport"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/TransportConfig",
                  label: "TransportConfig"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/TransportEvents",
                  label: "TransportEvents"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/TransportManagerOptions",
                  label: "TransportManagerOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/TransportOptions",
                  label: "TransportOptions"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/TransportStats",
                  label: "TransportStats"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/interfaces/WebSocketTransportOptions",
                  label: "WebSocketTransportOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/types/transport/type-aliases/ConnectionState",
                  label: "ConnectionState"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/type-aliases/StyleRange",
                  label: "StyleRange"
                },
                {
                  type: "doc",
                  id: "../website/api/types/transport/type-aliases/TransportType",
                  label: "TransportType"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/types/transport/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/types/index"
      }
    },
    {
      type: "category",
      label: "utils",
      items: [
        {
          type: "category",
          label: "browser-polyfills",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/browser-polyfills/variables/BROWSER_POLYFILLS",
                  label: "BROWSER_POLYFILLS"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/browser-polyfills/variables/fs",
                  label: "fs"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/browser-polyfills/variables/os",
                  label: "os"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/browser-polyfills/variables/path",
                  label: "path"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/browser-polyfills/index"
          }
        },
        {
          type: "category",
          label: "EnhancedConsole",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/EnhancedConsole/classes/EnhancedConsole",
                  label: "EnhancedConsole"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/EnhancedConsole/interfaces/EnhanceConsoleOptions",
                  label: "EnhanceConsoleOptions"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/EnhancedConsole/functions/enhanceConsole",
                  label: "enhanceConsole"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/EnhancedConsole/index"
          }
        },
        {
          type: "category",
          label: "environment",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/environment/functions/isBrowserEnvironment",
                  label: "isBrowserEnvironment"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/environment/functions/isNodeEnvironment",
                  label: "isNodeEnvironment"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/environment/index"
          }
        },
        {
          type: "category",
          label: "events-compat",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/events-compat/variables/Emitter",
                  label: "Emitter"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/events-compat/index"
          }
        },
        {
          type: "category",
          label: "fs-compatibility",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/fs-compatibility/functions/getModuleDirname",
                  label: "getModuleDirname"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/fs-compatibility/functions/readFileCompat",
                  label: "readFileCompat"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/fs-compatibility/functions/resolvePathCompat",
                  label: "resolvePathCompat"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/fs-compatibility/index"
          }
        },
        {
          type: "category",
          label: "idGenerator",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/idGenerator/functions/generateId",
                  label: "generateId"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/idGenerator/index"
          }
        },
        {
          type: "category",
          label: "LazySerializer",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/LazySerializer/classes/LazyLogEntry",
                  label: "LazyLogEntry"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/LazySerializer/classes/SchemaSerializer",
                  label: "SchemaSerializer"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/LazySerializer/index"
          }
        },
        {
          type: "category",
          label: "meta",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/meta/interfaces/MetaArg",
                  label: "MetaArg"
                }
              ]
            },
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/meta/variables/META_WRAPPER",
                  label: "META_WRAPPER"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/meta/functions/err",
                  label: "err"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/meta/functions/meta",
                  label: "meta"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/meta/index"
          }
        },
        {
          type: "category",
          label: "ObjectPool",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/ObjectPool/classes/LogEntryPool",
                  label: "LogEntryPool"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/ObjectPool/functions/getGlobalPool",
                  label: "getGlobalPool"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/ObjectPool/functions/resetGlobalPool",
                  label: "resetGlobalPool"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/ObjectPool/index"
          }
        },
        {
          type: "category",
          label: "style-extractor",
          items: [
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/style-extractor/functions/applyStyles",
                  label: "applyStyles"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/style-extractor/functions/extractStyles",
                  label: "extractStyles"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/style-extractor/functions/optimizeStyleRanges",
                  label: "optimizeStyleRanges"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/style-extractor/functions/validateStyleRanges",
                  label: "validateStyleRanges"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/style-extractor/index"
          }
        },
        {
          type: "category",
          label: "StyleCache",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/StyleCache/classes/StyleCache",
                  label: "StyleCache"
                }
              ]
            },
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/StyleCache/variables/styleCache",
                  label: "styleCache"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/StyleCache/index"
          }
        },
        {
          type: "category",
          label: "TableFormatter",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/TableFormatter/classes/TableFormatter",
                  label: "TableFormatter"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/TableFormatter/interfaces/TableOptions",
                  label: "TableOptions"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/TableFormatter/index"
          }
        },
        {
          type: "category",
          label: "terminal",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/terminal/variables/terminalSupport",
                  label: "terminalSupport"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/terminal/functions/getFallbackStyle",
                  label: "getFallbackStyle"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/terminal/functions/getTerminalSupport",
                  label: "getTerminalSupport"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/terminal/functions/getTerminalWidth",
                  label: "getTerminalWidth"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/terminal/functions/isStyleSupported",
                  label: "isStyleSupported"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/terminal/index"
          }
        },
        {
          type: "category",
          label: "TextStyler",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/TextStyler/classes/TextStyler",
                  label: "TextStyler"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/TextStyler/type-aliases/Part",
                  label: "Part"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/TextStyler/type-aliases/StyleMap",
                  label: "StyleMap"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/TextStyler/index"
          }
        },
        {
          type: "category",
          label: "trace-context",
          items: [
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/trace-context/interfaces/W3CTraceContext",
                  label: "W3CTraceContext"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/utils/trace-context/functions/createTraceparent",
                  label: "createTraceparent"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/trace-context/functions/extractTraceContext",
                  label: "extractTraceContext"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/trace-context/functions/generateSpanId",
                  label: "generateSpanId"
                },
                {
                  type: "doc",
                  id: "../website/api/utils/trace-context/functions/generateTraceId",
                  label: "generateTraceId"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/utils/trace-context/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "validation",
      items: [
        {
          type: "category",
          label: "SchemaValidator",
          items: [
            {
              type: "category",
              label: "Classes",
              items: [
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/classes/SchemaValidator",
                  label: "SchemaValidator"
                }
              ]
            },
            {
              type: "category",
              label: "Interfaces",
              items: [
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/ArraySchema",
                  label: "ArraySchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/BooleanSchema",
                  label: "BooleanSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/EnumSchema",
                  label: "EnumSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/LiteralSchema",
                  label: "LiteralSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/NumberSchema",
                  label: "NumberSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/ObjectSchema",
                  label: "ObjectSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/Schema",
                  label: "Schema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/StringSchema",
                  label: "StringSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/UnionSchema",
                  label: "UnionSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/ValidationError",
                  label: "ValidationError"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/interfaces/ValidationResult",
                  label: "ValidationResult"
                }
              ]
            },
            {
              type: "category",
              label: "Type Aliases",
              items: [
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/type-aliases/AnySchema",
                  label: "AnySchema"
                }
              ]
            },
            {
              type: "category",
              label: "Functions",
              items: [
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/array",
                  label: "array"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/boolean",
                  label: "boolean"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/enumSchema",
                  label: "enumSchema"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/literal",
                  label: "literal"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/nullable",
                  label: "nullable"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/number",
                  label: "number"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/object",
                  label: "object"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/optional",
                  label: "optional"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/string",
                  label: "string"
                },
                {
                  type: "doc",
                  id: "../website/api/validation/SchemaValidator/functions/union",
                  label: "union"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "../website/api/validation/SchemaValidator/index"
          }
        }
      ],
      link: {
        type: "doc",
        id: "../website/api/validation/index"
      }
    }
  ]
};
module.exports = typedocSidebar.items;