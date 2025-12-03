import yaml
import json

# Данные моделей из OpenRouter API
models_data = {
  "count": 335,
  "models": [
    {
      "id": "amazon/nova-2-lite-v1:free",
      "name": "Amazon: Nova 2 Lite (free)",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "amazon/nova-2-lite-v1",
      "name": "Amazon: Nova 2 Lite",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$2.5000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-large-2512",
      "name": "Mistral: Mistral Large 3 2512",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$1.5000"
      },
      "is_free": False
    },
    {
      "id": "arcee-ai/trinity-mini:free",
      "name": "Arcee AI: Trinity Mini (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "arcee-ai/trinity-mini",
      "name": "Arcee AI: Trinity Mini",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0450",
        "completion_per_1m": "$0.1500"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-v3.2-speciale",
      "name": "DeepSeek: DeepSeek V3.2 Speciale",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2800",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-v3.2",
      "name": "DeepSeek: DeepSeek V3.2",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2800",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "prime-intellect/intellect-3",
      "name": "Prime Intellect: INTELLECT-3",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$1.1000"
      },
      "is_free": False
    },
    {
      "id": "tngtech/tng-r1t-chimera:free",
      "name": "TNG: R1T Chimera (free)",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "tngtech/tng-r1t-chimera",
      "name": "TNG: R1T Chimera",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-opus-4.5",
      "name": "Anthropic: Claude Opus 4.5",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$5.0000",
        "completion_per_1m": "$25.0000"
      },
      "is_free": False
    },
    {
      "id": "allenai/olmo-3-32b-think:free",
      "name": "AllenAI: Olmo 3 32B Think (free)",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "allenai/olmo-3-7b-instruct",
      "name": "AllenAI: Olmo 3 7B Instruct",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "allenai/olmo-3-7b-think",
      "name": "AllenAI: Olmo 3 7B Think",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.1200",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-3-pro-image-preview",
      "name": "Google: Nano Banana Pro (Gemini 3 Pro Image Preview)",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$12.0000"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-4.1-fast:free",
      "name": "xAI: Grok 4.1 Fast (free)",
      "context_length": 2000000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "google/gemini-3-pro-preview",
      "name": "Google: Gemini 3 Pro Preview",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$12.0000"
      },
      "is_free": False
    },
    {
      "id": "deepcogito/cogito-v2.1-671b",
      "name": "Deep Cogito: Cogito v2.1 671B",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$1.2500"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5.1",
      "name": "OpenAI: GPT-5.1",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5.1-chat",
      "name": "OpenAI: GPT-5.1 Chat",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5.1-codex",
      "name": "OpenAI: GPT-5.1-Codex",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5.1-codex-mini",
      "name": "OpenAI: GPT-5.1-Codex-Mini",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "kwaipilot/kat-coder-pro:free",
      "name": "Kwaipilot: KAT-Coder-Pro V1 (free)",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "moonshotai/kimi-linear-48b-a3b-instruct",
      "name": "MoonshotAI: Kimi Linear 48B A3B Instruct",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "moonshotai/kimi-k2-thinking",
      "name": "MoonshotAI: Kimi K2 Thinking",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.4500",
        "completion_per_1m": "$2.3500"
      },
      "is_free": False
    },
    {
      "id": "amazon/nova-premier-v1",
      "name": "Amazon: Nova Premier 1.0",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$12.5000"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar-pro-search",
      "name": "Perplexity: Sonar Pro Search",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/voxtral-small-24b-2507",
      "name": "Mistral: Voxtral Small 24B 2507",
      "context_length": 32000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.3000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-oss-safeguard-20b",
      "name": "OpenAI: gpt-oss-safeguard-20b",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0750",
        "completion_per_1m": "$0.3000"
      },
      "is_free": False
    },
    {
      "id": "nvidia/nemotron-nano-12b-v2-vl:free",
      "name": "NVIDIA: Nemotron Nano 12B 2 VL (free)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "nvidia/nemotron-nano-12b-v2-vl",
      "name": "NVIDIA: Nemotron Nano 12B 2 VL",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "minimax/minimax-m2",
      "name": "MiniMax: MiniMax M2",
      "context_length": 204800,
      "pricing": {
        "prompt_per_1m": "$0.2550",
        "completion_per_1m": "$1.0200"
      },
      "is_free": False
    },
    {
      "id": "liquid/lfm2-8b-a1b",
      "name": "LiquidAI/LFM2-8B-A1B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "liquid/lfm-2.2-6b",
      "name": "LiquidAI/LFM2-2.6B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "ibm-granite/granite-4.0-h-micro",
      "name": "IBM: Granite 4.0 Micro",
      "context_length": 131000,
      "pricing": {
        "prompt_per_1m": "$0.0170",
        "completion_per_1m": "$0.1100"
      },
      "is_free": False
    },
    {
      "id": "deepcogito/cogito-v2-preview-llama-405b",
      "name": "Deep Cogito: Cogito V2 Preview Llama 405B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$3.5000",
        "completion_per_1m": "$3.5000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-image-mini",
      "name": "OpenAI: GPT-5 Image Mini",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-haiku-4.5",
      "name": "Anthropic: Claude Haiku 4.5",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-8b-thinking",
      "name": "Qwen: Qwen3 VL 8B Thinking",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.1800",
        "completion_per_1m": "$2.1000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-8b-instruct",
      "name": "Qwen: Qwen3 VL 8B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0640",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-image",
      "name": "OpenAI: GPT-5 Image",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$10.0000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/o3-deep-research",
      "name": "OpenAI: o3 Deep Research",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$10.0000",
        "completion_per_1m": "$40.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/o4-mini-deep-research",
      "name": "OpenAI: o4 Mini Deep Research",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      "name": "NVIDIA: Llama 3.3 Nemotron Super 49B V1.5",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "baidu/ernie-4.5-21b-a3b-thinking",
      "name": "Baidu: ERNIE 4.5 21B A3B Thinking",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0560",
        "completion_per_1m": "$0.2240"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash-image",
      "name": "Google: Gemini 2.5 Flash Image (Nano Banana)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$2.5000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-30b-a3b-thinking",
      "name": "Qwen: Qwen3 VL 30B A3B Thinking",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1600",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-30b-a3b-instruct",
      "name": "Qwen: Qwen3 VL 30B A3B Instruct",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-pro",
      "name": "OpenAI: GPT-5 Pro",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$15.0000",
        "completion_per_1m": "$120.0000"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4.6",
      "name": "Z.AI: GLM 4.6",
      "context_length": 202752,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$1.7500"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4.6:exacto",
      "name": "Z.AI: GLM 4.6 (exacto)",
      "context_length": 204800,
      "pricing": {
        "prompt_per_1m": "$0.4400",
        "completion_per_1m": "$1.7600"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-sonnet-4.5",
      "name": "Anthropic: Claude Sonnet 4.5",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-v3.2-exp",
      "name": "DeepSeek: DeepSeek V3.2 Exp",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2100",
        "completion_per_1m": "$0.3200"
      },
      "is_free": False
    },
    {
      "id": "thedrummer/cydonia-24b-v4.1",
      "name": "TheDrummer: Cydonia 24B V4.1",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.5000"
      },
      "is_free": False
    },
    {
      "id": "relace/relace-apply-3",
      "name": "Relace: Relace Apply 3",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.8500",
        "completion_per_1m": "$1.2500"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash-preview-09-2025",
      "name": "Google: Gemini 2.5 Flash Preview 09-2025",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash-lite-preview-09-2025",
      "name": "Google: Gemini 2.5 Flash Lite Preview 09-2025",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-235b-a22b-thinking",
      "name": "Qwen: Qwen3 VL 235B A22B Thinking",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-vl-235b-a22b-instruct",
      "name": "Qwen: Qwen3 VL 235B A22B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.2100",
        "completion_per_1m": "$1.9000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-max",
      "name": "Qwen: Qwen3 Max",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$1.2000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-coder-plus",
      "name": "Qwen: Qwen3 Coder Plus",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-codex",
      "name": "OpenAI: GPT-5 Codex",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-v3.1-terminus",
      "name": "DeepSeek: DeepSeek V3.1 Terminus",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2100",
        "completion_per_1m": "$0.7900"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-v3.1-terminus:exacto",
      "name": "DeepSeek: DeepSeek V3.1 Terminus (exacto)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.2160",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-4-fast",
      "name": "xAI: Grok 4 Fast",
      "context_length": 2000000,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.5000"
      },
      "is_free": False
    },
    {
      "id": "alibaba/tongyi-deepresearch-30b-a3b:free",
      "name": "Tongyi DeepResearch 30B A3B (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "alibaba/tongyi-deepresearch-30b-a3b",
      "name": "Tongyi DeepResearch 30B A3B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0900",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-coder-flash",
      "name": "Qwen: Qwen3 Coder Flash",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.5000"
      },
      "is_free": False
    },
    {
      "id": "opengvlab/internvl3-78b",
      "name": "OpenGVLab: InternVL3 78B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0700",
        "completion_per_1m": "$0.2600"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-next-80b-a3b-thinking",
      "name": "Qwen: Qwen3 Next 80B A3B Thinking",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1200",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-next-80b-a3b-instruct",
      "name": "Qwen: Qwen3 Next 80B A3B Instruct",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "meituan/longcat-flash-chat:free",
      "name": "Meituan: LongCat Flash Chat (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "meituan/longcat-flash-chat",
      "name": "Meituan: LongCat Flash Chat",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.7500"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-plus-2025-07-28",
      "name": "Qwen: Qwen Plus 0728",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-plus-2025-07-28:thinking",
      "name": "Qwen: Qwen Plus 0728 (thinking)",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$4.0000"
      },
      "is_free": False
    },
    {
      "id": "nvidia/nemotron-nano-9b-v2:free",
      "name": "NVIDIA: Nemotron Nano 9B V2 (free)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "nvidia/nemotron-nano-9b-v2",
      "name": "NVIDIA: Nemotron Nano 9B V2",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.1600"
      },
      "is_free": False
    },
    {
      "id": "moonshotai/kimi-k2-0905",
      "name": "MoonshotAI: Kimi K2 0905",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.3900",
        "completion_per_1m": "$1.9000"
      },
      "is_free": False
    },
    {
      "id": "moonshotai/kimi-k2-0905:exacto",
      "name": "MoonshotAI: Kimi K2 0905 (exacto)",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.6000",
        "completion_per_1m": "$2.5000"
      },
      "is_free": False
    },
    {
      "id": "deepcogito/cogito-v2-preview-llama-70b",
      "name": "Deep Cogito: Cogito V2 Preview Llama 70B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.8800",
        "completion_per_1m": "$0.8800"
      },
      "is_free": False
    },
    {
      "id": "deepcogito/cogito-v2-preview-llama-109b-moe",
      "name": "Cogito V2 Preview Llama 109B",
      "context_length": 32767,
      "pricing": {
        "prompt_per_1m": "$0.1800",
        "completion_per_1m": "$0.5900"
      },
      "is_free": False
    },
    {
      "id": "deepcogito/cogito-v2-preview-deepseek-671b",
      "name": "Deep Cogito: Cogito V2 Preview Deepseek 671B",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$1.2500"
      },
      "is_free": False
    },
    {
      "id": "stepfun-ai/step3",
      "name": "StepFun: Step3",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.5700",
        "completion_per_1m": "$1.4200"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-30b-a3b-thinking-2507",
      "name": "Qwen: Qwen3 30B A3B Thinking 2507",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0510",
        "completion_per_1m": "$0.3400"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-code-fast-1",
      "name": "xAI: Grok Code Fast 1",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$1.5000"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/hermes-4-70b",
      "name": "Nous: Hermes 4 70B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1100",
        "completion_per_1m": "$0.3800"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/hermes-4-405b",
      "name": "Nous: Hermes 4 405B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash-image-preview",
      "name": "Google: Gemini 2.5 Flash Image Preview (Nano Banana)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$2.5000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-chat-v3.1",
      "name": "DeepSeek: DeepSeek V3.1",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-audio-preview",
      "name": "OpenAI: GPT-4o Audio",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-medium-3.1",
      "name": "Mistral: Mistral Medium 3.1",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "baidu/ernie-4.5-21b-a3b",
      "name": "Baidu: ERNIE 4.5 21B A3B",
      "context_length": 120000,
      "pricing": {
        "prompt_per_1m": "$0.0560",
        "completion_per_1m": "$0.2240"
      },
      "is_free": False
    },
    {
      "id": "baidu/ernie-4.5-vl-28b-a3b",
      "name": "Baidu: ERNIE 4.5 VL 28B A3B",
      "context_length": 30000,
      "pricing": {
        "prompt_per_1m": "$0.1120",
        "completion_per_1m": "$0.4480"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4.5v",
      "name": "Z.AI: GLM 4.5V",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.4800",
        "completion_per_1m": "$1.4400"
      },
      "is_free": False
    },
    {
      "id": "ai21/jamba-mini-1.7",
      "name": "AI21: Jamba Mini 1.7",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "ai21/jamba-large-1.7",
      "name": "AI21: Jamba Large 1.7",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-chat",
      "name": "OpenAI: GPT-5 Chat",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5",
      "name": "OpenAI: GPT-5",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-mini",
      "name": "OpenAI: GPT-5 Mini",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-5-nano",
      "name": "OpenAI: GPT-5 Nano",
      "context_length": 400000,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-oss-120b:exacto",
      "name": "OpenAI: gpt-oss-120b (exacto)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-oss-120b",
      "name": "OpenAI: gpt-oss-120b",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-oss-20b:free",
      "name": "OpenAI: gpt-oss-20b (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "openai/gpt-oss-20b",
      "name": "OpenAI: gpt-oss-20b",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1400"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-opus-4.1",
      "name": "Anthropic: Claude Opus 4.1",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$15.0000",
        "completion_per_1m": "$75.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/codestral-2508",
      "name": "Mistral: Codestral 2508",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.9000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-coder-30b-a3b-instruct",
      "name": "Qwen: Qwen3 Coder 30B A3B Instruct",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.2500"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-30b-a3b-instruct-2507",
      "name": "Qwen: Qwen3 30B A3B Instruct 2507",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.0800",
        "completion_per_1m": "$0.3300"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4.5",
      "name": "Z.AI: GLM 4.5",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.3500",
        "completion_per_1m": "$1.5500"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4.5-air:free",
      "name": "Z.AI: GLM 4.5 Air (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "z-ai/glm-4.5-air",
      "name": "Z.AI: GLM 4.5 Air",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1040",
        "completion_per_1m": "$0.6800"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-235b-a22b-thinking-2507",
      "name": "Qwen: Qwen3 235B A22B Thinking 2507",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.1100",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "z-ai/glm-4-32b",
      "name": "Z.AI: GLM 4 32B ",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-coder:free",
      "name": "Qwen: Qwen3 Coder 480B A35B (free)",
      "context_length": 262000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "qwen/qwen3-coder",
      "name": "Qwen: Qwen3 Coder 480B A35B",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.2200",
        "completion_per_1m": "$0.9500"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-coder:exacto",
      "name": "Qwen: Qwen3 Coder 480B A35B (exacto)",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.3800",
        "completion_per_1m": "$1.5300"
      },
      "is_free": False
    },
    {
      "id": "bytedance/ui-tars-1.5-7b",
      "name": "ByteDance: UI-TARS 7B ",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash-lite",
      "name": "Google: Gemini 2.5 Flash Lite",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-235b-a22b-2507",
      "name": "Qwen: Qwen3 235B A22B Instruct 2507",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0720",
        "completion_per_1m": "$0.4640"
      },
      "is_free": False
    },
    {
      "id": "switchpoint/router",
      "name": "Switchpoint Router",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.8500",
        "completion_per_1m": "$3.4000"
      },
      "is_free": False
    },
    {
      "id": "moonshotai/kimi-k2:free",
      "name": "MoonshotAI: Kimi K2 0711 (free)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "moonshotai/kimi-k2",
      "name": "MoonshotAI: Kimi K2 0711",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4560",
        "completion_per_1m": "$1.8400"
      },
      "is_free": False
    },
    {
      "id": "thudm/glm-4.1v-9b-thinking",
      "name": "THUDM: GLM 4.1V 9B Thinking",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.0280",
        "completion_per_1m": "$0.1104"
      },
      "is_free": False
    },
    {
      "id": "mistralai/devstral-medium",
      "name": "Mistral: Devstral Medium",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/devstral-small",
      "name": "Mistral: Devstral Small 1.1",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0700",
        "completion_per_1m": "$0.2800"
      },
      "is_free": False
    },
    {
      "id": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
      "name": "Venice: Uncensored (free)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "x-ai/grok-4",
      "name": "xAI: Grok 4",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-3n-e2b-it:free",
      "name": "Google: Gemma 3n 2B (free)",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "tencent/hunyuan-a13b-instruct",
      "name": "Tencent: Hunyuan A13B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1400",
        "completion_per_1m": "$0.5700"
      },
      "is_free": False
    },
    {
      "id": "tngtech/deepseek-r1t2-chimera:free",
      "name": "TNG: DeepSeek R1T2 Chimera (free)",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "tngtech/deepseek-r1t2-chimera",
      "name": "TNG: DeepSeek R1T2 Chimera",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "morph/morph-v3-large",
      "name": "Morph: Morph V3 Large",
      "context_length": 262144,
      "pricing": {
        "prompt_per_1m": "$0.9000",
        "completion_per_1m": "$1.9000"
      },
      "is_free": False
    },
    {
      "id": "morph/morph-v3-fast",
      "name": "Morph: Morph V3 Fast",
      "context_length": 81920,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "baidu/ernie-4.5-vl-424b-a47b",
      "name": "Baidu: ERNIE 4.5 VL 424B A47B ",
      "context_length": 123000,
      "pricing": {
        "prompt_per_1m": "$0.3360",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "baidu/ernie-4.5-300b-a47b",
      "name": "Baidu: ERNIE 4.5 300B A47B ",
      "context_length": 123000,
      "pricing": {
        "prompt_per_1m": "$0.2240",
        "completion_per_1m": "$0.8800"
      },
      "is_free": False
    },
    {
      "id": "thedrummer/anubis-70b-v1.1",
      "name": "TheDrummer: Anubis 70B V1.1",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.7500",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "inception/mercury",
      "name": "Inception: Mercury",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-small-3.2-24b-instruct",
      "name": "Mistral: Mistral Small 3.2 24B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1100"
      },
      "is_free": False
    },
    {
      "id": "minimax/minimax-01",
      "name": "MiniMax: MiniMax-01",
      "context_length": 1000192,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$1.1000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-flash",
      "name": "Google: Gemini 2.5 Flash",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$2.5000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-pro",
      "name": "Google: Gemini 2.5 Pro",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "moonshotai/kimi-dev-72b",
      "name": "MoonshotAI: Kimi Dev 72B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.2900",
        "completion_per_1m": "$1.1500"
      },
      "is_free": False
    },
    {
      "id": "openai/o3-pro",
      "name": "OpenAI: o3 Pro",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$20.0000",
        "completion_per_1m": "$80.0000"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-3-mini",
      "name": "xAI: Grok 3 Mini",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.5000"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-3",
      "name": "xAI: Grok 3",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/magistral-small-2506",
      "name": "Mistral: Magistral Small 2506",
      "context_length": 40000,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$1.5000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/magistral-medium-2506:thinking",
      "name": "Mistral: Magistral Medium 2506 (thinking)",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/magistral-medium-2506",
      "name": "Mistral: Magistral Medium 2506",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-pro-preview",
      "name": "Google: Gemini 2.5 Pro Preview 06-05",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-r1-0528-qwen3-8b",
      "name": "DeepSeek: DeepSeek R1 0528 Qwen3 8B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-r1-0528",
      "name": "DeepSeek: R1 0528",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$4.5000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-opus-4",
      "name": "Anthropic: Claude Opus 4",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$15.0000",
        "completion_per_1m": "$75.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-sonnet-4",
      "name": "Anthropic: Claude Sonnet 4",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/devstral-small-2505",
      "name": "Mistral: Devstral Small 2505",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.1200"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-3n-e4b-it:free",
      "name": "Google: Gemma 3n 4B (free)",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "google/gemma-3n-e4b-it",
      "name": "Google: Gemma 3n 4B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.0400"
      },
      "is_free": False
    },
    {
      "id": "openai/codex-mini",
      "name": "OpenAI: Codex Mini",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.5000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/deephermes-3-mistral-24b-preview",
      "name": "NousResearch: DeepHermes 3 Mistral 24B Preview",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-medium-3",
      "name": "Mistral: Mistral Medium 3",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.5-pro-preview-05-06",
      "name": "Google: Gemini 2.5 Pro Preview 05-06",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$1.2500",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "arcee-ai/spotlight",
      "name": "Arcee AI: Spotlight",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1800",
        "completion_per_1m": "$0.1800"
      },
      "is_free": False
    },
    {
      "id": "arcee-ai/maestro-reasoning",
      "name": "Arcee AI: Maestro Reasoning",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.9000",
        "completion_per_1m": "$3.3000"
      },
      "is_free": False
    },
    {
      "id": "arcee-ai/virtuoso-large",
      "name": "Arcee AI: Virtuoso Large",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.7500",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "arcee-ai/coder-large",
      "name": "Arcee AI: Coder Large",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-4-reasoning-plus",
      "name": "Microsoft: Phi 4 Reasoning Plus",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0700",
        "completion_per_1m": "$0.3500"
      },
      "is_free": False
    },
    {
      "id": "inception/mercury-coder",
      "name": "Inception: Mercury Coder",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-4b:free",
      "name": "Qwen: Qwen3 4B (free)",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "deepseek/deepseek-prover-v2",
      "name": "DeepSeek: DeepSeek Prover V2",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$2.1800"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-guard-4-12b",
      "name": "Meta: LlamaGuard 4 12B",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.1800",
        "completion_per_1m": "$0.1800"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-30b-a3b",
      "name": "Qwen: Qwen3 30B A3B",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.2200"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-8b",
      "name": "Qwen: Qwen3 8B",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0280",
        "completion_per_1m": "$0.1104"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-14b",
      "name": "Qwen: Qwen3 14B",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.2200"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-32b",
      "name": "Qwen: Qwen3 32B",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$0.0800",
        "completion_per_1m": "$0.2400"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen3-235b-a22b:free",
      "name": "Qwen: Qwen3 235B A22B (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "qwen/qwen3-235b-a22b",
      "name": "Qwen: Qwen3 235B A22B",
      "context_length": 40960,
      "pricing": {
        "prompt_per_1m": "$0.1800",
        "completion_per_1m": "$0.5400"
      },
      "is_free": False
    },
    {
      "id": "tngtech/deepseek-r1t-chimera:free",
      "name": "TNG: DeepSeek R1T Chimera (free)",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "tngtech/deepseek-r1t-chimera",
      "name": "TNG: DeepSeek R1T Chimera",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/mai-ds-r1",
      "name": "Microsoft: MAI DS R1",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "openai/o4-mini-high",
      "name": "OpenAI: o4 Mini High",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.1000",
        "completion_per_1m": "$4.4000"
      },
      "is_free": False
    },
    {
      "id": "openai/o3",
      "name": "OpenAI: o3",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/o4-mini",
      "name": "OpenAI: o4 Mini",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.1000",
        "completion_per_1m": "$4.4000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen2.5-coder-7b-instruct",
      "name": "Qwen: Qwen2.5 Coder 7B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.0900"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4.1",
      "name": "OpenAI: GPT-4.1",
      "context_length": 1047576,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4.1-mini",
      "name": "OpenAI: GPT-4.1 Mini",
      "context_length": 1047576,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$1.6000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4.1-nano",
      "name": "OpenAI: GPT-4.1 Nano",
      "context_length": 1047576,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "eleutherai/llemma_7b",
      "name": "EleutherAI: Llemma 7b",
      "context_length": 4096,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "alfredpros/codellama-7b-instruct-solidity",
      "name": "AlfredPros: CodeLLaMa 7B Instruct Solidity",
      "context_length": 4096,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "arliai/qwq-32b-arliai-rpr-v1",
      "name": "ArliAI: QwQ 32B RpR v1",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1100"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-3-mini-beta",
      "name": "xAI: Grok 3 Mini Beta",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.5000"
      },
      "is_free": False
    },
    {
      "id": "x-ai/grok-3-beta",
      "name": "xAI: Grok 3 Beta",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      "name": "NVIDIA: Llama 3.1 Nemotron Ultra 253B v1",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.6000",
        "completion_per_1m": "$1.8000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-4-maverick",
      "name": "Meta: Llama 4 Maverick",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.1360",
        "completion_per_1m": "$0.6800"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-4-scout",
      "name": "Meta: Llama 4 Scout",
      "context_length": 327680,
      "pricing": {
        "prompt_per_1m": "$0.0800",
        "completion_per_1m": "$0.3000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen2.5-vl-32b-instruct",
      "name": "Qwen: Qwen2.5 VL 32B Instruct",
      "context_length": 16384,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.2200"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-chat-v3-0324",
      "name": "DeepSeek: DeepSeek V3 0324",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.8800"
      },
      "is_free": False
    },
    {
      "id": "openai/o1-pro",
      "name": "OpenAI: o1-pro",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$150.0000",
        "completion_per_1m": "$600.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-small-3.1-24b-instruct:free",
      "name": "Mistral: Mistral Small 3.1 24B (free)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "mistralai/mistral-small-3.1-24b-instruct",
      "name": "Mistral: Mistral Small 3.1 24B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1100"
      },
      "is_free": False
    },
    {
      "id": "allenai/olmo-2-0325-32b-instruct",
      "name": "AllenAI: Olmo 2 32B Instruct",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-3-4b-it:free",
      "name": "Google: Gemma 3 4B (free)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "google/gemma-3-12b-it:free",
      "name": "Google: Gemma 3 12B (free)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "google/gemma-3-12b-it",
      "name": "Google: Gemma 3 12B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "cohere/command-a",
      "name": "Cohere: Command A",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-mini-search-preview",
      "name": "OpenAI: GPT-4o-mini Search Preview",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-search-preview",
      "name": "OpenAI: GPT-4o Search Preview",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-3-27b-it:free",
      "name": "Google: Gemma 3 27B (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "google/gemma-3-27b-it",
      "name": "Google: Gemma 3 27B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0700",
        "completion_per_1m": "$0.5000"
      },
      "is_free": False
    },
    {
      "id": "thedrummer/skyfall-36b-v2",
      "name": "TheDrummer: Skyfall 36B V2",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$0.8000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-3.5-mini-128k-instruct",
      "name": "Microsoft: Phi-3.5 Mini 128K Instruct",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar-reasoning-pro",
      "name": "Perplexity: Sonar Reasoning Pro",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar-pro",
      "name": "Perplexity: Sonar Pro",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar-deep-research",
      "name": "Perplexity: Sonar Deep Research",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwq-32b",
      "name": "Qwen: QwQ 32B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.0-flash-lite-001",
      "name": "Google: Gemini 2.0 Flash Lite",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.0750",
        "completion_per_1m": "$0.3000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3.7-sonnet:thinking",
      "name": "Anthropic: Claude 3.7 Sonnet (thinking)",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3.7-sonnet",
      "name": "Anthropic: Claude 3.7 Sonnet",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-saba",
      "name": "Mistral: Saba",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-guard-3-8b",
      "name": "Llama Guard 3 8B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.0600"
      },
      "is_free": False
    },
    {
      "id": "openai/o3-mini-high",
      "name": "OpenAI: o3 Mini High",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.1000",
        "completion_per_1m": "$4.4000"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.0-flash-001",
      "name": "Google: Gemini 2.0 Flash",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-vl-plus",
      "name": "Qwen: Qwen VL Plus",
      "context_length": 7500,
      "pricing": {
        "prompt_per_1m": "$0.2100",
        "completion_per_1m": "$0.6300"
      },
      "is_free": False
    },
    {
      "id": "aion-labs/aion-1.0",
      "name": "AionLabs: Aion-1.0",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$4.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "aion-labs/aion-1.0-mini",
      "name": "AionLabs: Aion-1.0-Mini",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.7000",
        "completion_per_1m": "$1.4000"
      },
      "is_free": False
    },
    {
      "id": "aion-labs/aion-rp-llama-3.1-8b",
      "name": "AionLabs: Aion-RP 1.0 (8B)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-vl-max",
      "name": "Qwen: Qwen VL Max",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$3.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-turbo",
      "name": "Qwen: Qwen-Turbo",
      "context_length": 1000000,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen2.5-vl-72b-instruct",
      "name": "Qwen: Qwen2.5 VL 72B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1300"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-plus",
      "name": "Qwen: Qwen-Plus",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-max",
      "name": "Qwen: Qwen-Max ",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$1.6000",
        "completion_per_1m": "$6.4000"
      },
      "is_free": False
    },
    {
      "id": "openai/o3-mini",
      "name": "OpenAI: o3 Mini",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$1.1000",
        "completion_per_1m": "$4.4000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-small-24b-instruct-2501",
      "name": "Mistral: Mistral Small 3",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0500",
        "completion_per_1m": "$0.0800"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-r1-distill-qwen-32b",
      "name": "DeepSeek: R1 Distill Qwen 32B",
      "context_length": 64000,
      "pricing": {
        "prompt_per_1m": "$0.2400",
        "completion_per_1m": "$0.2400"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar-reasoning",
      "name": "Perplexity: Sonar Reasoning",
      "context_length": 127000,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "perplexity/sonar",
      "name": "Perplexity: Sonar",
      "context_length": 127072,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-r1-distill-llama-70b",
      "name": "DeepSeek: R1 Distill Llama 70B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1300"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-r1",
      "name": "DeepSeek: R1",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "minimax/minimax-01",
      "name": "MiniMax: MiniMax-01",
      "context_length": 1000192,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$1.1000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/codestral-2501",
      "name": "Mistral: Codestral 2501",
      "context_length": 256000,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.9000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-4",
      "name": "Microsoft: Phi 4",
      "context_length": 16384,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.1400"
      },
      "is_free": False
    },
    {
      "id": "sao10k/l3.1-70b-hanami-x1",
      "name": "Sao10K: Llama 3.1 70B Hanami x1",
      "context_length": 16000,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$3.0000"
      },
      "is_free": False
    },
    {
      "id": "deepseek/deepseek-chat",
      "name": "DeepSeek: DeepSeek V3",
      "context_length": 163840,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "sao10k/l3.3-euryale-70b",
      "name": "Sao10K: Llama 3.3 Euryale 70B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.6500",
        "completion_per_1m": "$0.7500"
      },
      "is_free": False
    },
    {
      "id": "openai/o1",
      "name": "OpenAI: o1",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$15.0000",
        "completion_per_1m": "$60.0000"
      },
      "is_free": False
    },
    {
      "id": "cohere/command-r7b-12-2024",
      "name": "Cohere: Command R7B (12-2024)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0375",
        "completion_per_1m": "$0.1500"
      },
      "is_free": False
    },
    {
      "id": "google/gemini-2.0-flash-exp:free",
      "name": "Google: Gemini 2.0 Flash Experimental (free)",
      "context_length": 1048576,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "meta-llama/llama-3.3-70b-instruct:free",
      "name": "Meta: Llama 3.3 70B Instruct (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "meta-llama/llama-3.3-70b-instruct",
      "name": "Meta: Llama 3.3 70B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1040",
        "completion_per_1m": "$0.3120"
      },
      "is_free": False
    },
    {
      "id": "amazon/nova-lite-v1",
      "name": "Amazon: Nova Lite 1.0",
      "context_length": 300000,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.2400"
      },
      "is_free": False
    },
    {
      "id": "amazon/nova-micro-v1",
      "name": "Amazon: Nova Micro 1.0",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.0350",
        "completion_per_1m": "$0.1400"
      },
      "is_free": False
    },
    {
      "id": "amazon/nova-pro-v1",
      "name": "Amazon: Nova Pro 1.0",
      "context_length": 300000,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$3.2000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-2024-11-20",
      "name": "OpenAI: GPT-4o (2024-11-20)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-large-2411",
      "name": "Mistral Large 2411",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-large-2407",
      "name": "Mistral Large 2407",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/pixtral-large-2411",
      "name": "Mistral: Pixtral Large 2411",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-2.5-coder-32b-instruct",
      "name": "Qwen2.5 Coder 32B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.1100"
      },
      "is_free": False
    },
    {
      "id": "raifle/sorcererlm-8x22b",
      "name": "SorcererLM 8x22B",
      "context_length": 16000,
      "pricing": {
        "prompt_per_1m": "$4.5000",
        "completion_per_1m": "$4.5000"
      },
      "is_free": False
    },
    {
      "id": "thedrummer/unslopnemo-12b",
      "name": "TheDrummer: UnslopNemo 12B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3.5-haiku-20241022",
      "name": "Anthropic: Claude 3.5 Haiku (2024-10-22)",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$4.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3.5-haiku",
      "name": "Anthropic: Claude 3.5 Haiku",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$0.8000",
        "completion_per_1m": "$4.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Anthropic: Claude 3.5 Sonnet",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$6.0000",
        "completion_per_1m": "$30.0000"
      },
      "is_free": False
    },
    {
      "id": "anthracite-org/magnum-v4-72b",
      "name": "Magnum v4 72B",
      "context_length": 16384,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$5.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/ministral-8b",
      "name": "Mistral: Ministral 8B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/ministral-3b",
      "name": "Mistral: Ministral 3B",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.0400"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-2.5-7b-instruct",
      "name": "Qwen: Qwen2.5 7B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "nvidia/llama-3.1-nemotron-70b-instruct",
      "name": "NVIDIA: Llama 3.1 Nemotron 70B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$1.2000",
        "completion_per_1m": "$1.2000"
      },
      "is_free": False
    },
    {
      "id": "inflection/inflection-3-pi",
      "name": "Inflection: Inflection 3 Pi",
      "context_length": 8000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "inflection/inflection-3-productivity",
      "name": "Inflection: Inflection 3 Productivity",
      "context_length": 8000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "thedrummer/rocinante-12b",
      "name": "TheDrummer: Rocinante 12B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.1700",
        "completion_per_1m": "$0.4300"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.2-3b-instruct:free",
      "name": "Meta: Llama 3.2 3B Instruct (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "meta-llama/llama-3.2-3b-instruct",
      "name": "Meta: Llama 3.2 3B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.0200"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.2-1b-instruct",
      "name": "Meta: Llama 3.2 1B Instruct",
      "context_length": 60000,
      "pricing": {
        "prompt_per_1m": "$0.0270",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.2-90b-vision-instruct",
      "name": "Meta: Llama 3.2 90B Vision Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.3500",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.2-11b-vision-instruct",
      "name": "Meta: Llama 3.2 11B Vision Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0490",
        "completion_per_1m": "$0.0490"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-2.5-72b-instruct",
      "name": "Qwen2.5 72B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0700",
        "completion_per_1m": "$0.2600"
      },
      "is_free": False
    },
    {
      "id": "neversleep/noromaid-20b",
      "name": "Noromaid 20B",
      "context_length": 4096,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$1.7500"
      },
      "is_free": False
    },
    {
      "id": "mistralai/pixtral-12b",
      "name": "Mistral: Pixtral 12B",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "cohere/command-r-08-2024",
      "name": "Cohere: Command R (08-2024)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "cohere/command-r-plus-08-2024",
      "name": "Cohere: Command R+ (08-2024)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "sao10k/l3.1-euryale-70b",
      "name": "Sao10K: Llama 3.1 Euryale 70B v2.2",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.6500",
        "completion_per_1m": "$0.7500"
      },
      "is_free": False
    },
    {
      "id": "qwen/qwen-2.5-vl-7b-instruct",
      "name": "Qwen: Qwen2.5-VL 7B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-3.5-mini-128k-instruct",
      "name": "Microsoft: Phi-3.5 Mini 128K Instruct",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/hermes-3-llama-3.1-70b",
      "name": "Nous: Hermes 3 70B Instruct",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.3000"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/hermes-3-llama-3.1-405b:free",
      "name": "Nous: Hermes 3 405B Instruct (free)",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "nousresearch/hermes-3-llama-3.1-405b",
      "name": "Nous: Hermes 3 405B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/chatgpt-4o-latest",
      "name": "OpenAI: ChatGPT-4o",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$5.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "sao10k/l3-lunaris-8b",
      "name": "Sao10K: Llama 3 8B Lunaris",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0400",
        "completion_per_1m": "$0.0500"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-2024-08-06",
      "name": "OpenAI: GPT-4o (2024-08-06)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.1-405b",
      "name": "Meta: Llama 3.1 405B (base)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$4.0000",
        "completion_per_1m": "$4.0000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.1-70b-instruct",
      "name": "Meta: Llama 3.1 70B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.4000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.1-405b-instruct",
      "name": "Meta: Llama 3.1 405B Instruct",
      "context_length": 130815,
      "pricing": {
        "prompt_per_1m": "$3.5000",
        "completion_per_1m": "$3.5000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3.1-8b-instruct",
      "name": "Meta: Llama 3.1 8B Instruct",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.0300"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-nemo",
      "name": "Mistral: Mistral Nemo",
      "context_length": 131072,
      "pricing": {
        "prompt_per_1m": "$0.0200",
        "completion_per_1m": "$0.0400"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-mini-2024-07-18",
      "name": "OpenAI: GPT-4o-mini (2024-07-18)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-mini",
      "name": "OpenAI: GPT-4o-mini",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1500",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-2-27b-it",
      "name": "Google: Gemma 2 27B",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.6500",
        "completion_per_1m": "$0.6500"
      },
      "is_free": False
    },
    {
      "id": "google/gemma-2-9b-it",
      "name": "Google: Gemma 2 9B",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.0900"
      },
      "is_free": False
    },
    {
      "id": "sao10k/l3-euryale-70b",
      "name": "Sao10k: Llama 3 Euryale 70B v2.1",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$1.4800",
        "completion_per_1m": "$1.4800"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-7b-instruct:free",
      "name": "Mistral: Mistral 7B Instruct (free)",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0000",
        "completion_per_1m": "$0.0000"
      },
      "is_free": True
    },
    {
      "id": "mistralai/mistral-7b-instruct",
      "name": "Mistral: Mistral 7B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.0280",
        "completion_per_1m": "$0.0540"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-7b-instruct-v0.3",
      "name": "Mistral: Mistral 7B Instruct v0.3",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "nousresearch/hermes-2-pro-llama-3-8b",
      "name": "NousResearch: Hermes 2 Pro - Llama-3 8B",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0250",
        "completion_per_1m": "$0.0800"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-3-mini-128k-instruct",
      "name": "Microsoft: Phi-3 Mini 128K Instruct",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$0.1000",
        "completion_per_1m": "$0.1000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/phi-3-medium-128k-instruct",
      "name": "Microsoft: Phi-3 Medium 128K Instruct",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$1.0000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-guard-2-8b",
      "name": "Meta: LlamaGuard 2 8B",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o",
      "name": "OpenAI: GPT-4o",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.5000",
        "completion_per_1m": "$10.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o:extended",
      "name": "OpenAI: GPT-4o (extended)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$6.0000",
        "completion_per_1m": "$18.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4o-2024-05-13",
      "name": "OpenAI: GPT-4o (2024-05-13)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$5.0000",
        "completion_per_1m": "$15.0000"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3-8b-instruct",
      "name": "Meta: Llama 3 8B Instruct",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.0300",
        "completion_per_1m": "$0.0600"
      },
      "is_free": False
    },
    {
      "id": "meta-llama/llama-3-70b-instruct",
      "name": "Meta: Llama 3 70B Instruct",
      "context_length": 8192,
      "pricing": {
        "prompt_per_1m": "$0.3000",
        "completion_per_1m": "$0.4000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mixtral-8x22b-instruct",
      "name": "Mistral: Mixtral 8x22B Instruct",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "microsoft/wizardlm-2-8x22b",
      "name": "WizardLM-2 8x22B",
      "context_length": 65536,
      "pricing": {
        "prompt_per_1m": "$0.4800",
        "completion_per_1m": "$0.4800"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4-turbo",
      "name": "OpenAI: GPT-4 Turbo",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$10.0000",
        "completion_per_1m": "$30.0000"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3-haiku",
      "name": "Anthropic: Claude 3 Haiku",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$1.2500"
      },
      "is_free": False
    },
    {
      "id": "anthropic/claude-3-opus",
      "name": "Anthropic: Claude 3 Opus",
      "context_length": 200000,
      "pricing": {
        "prompt_per_1m": "$15.0000",
        "completion_per_1m": "$75.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-large",
      "name": "Mistral Large",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$2.0000",
        "completion_per_1m": "$6.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4-turbo-preview",
      "name": "OpenAI: GPT-4 Turbo Preview",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$10.0000",
        "completion_per_1m": "$30.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-3.5-turbo-0613",
      "name": "OpenAI: GPT-3.5 Turbo (older v0613)",
      "context_length": 4095,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-tiny",
      "name": "Mistral Tiny",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2500",
        "completion_per_1m": "$0.2500"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-small",
      "name": "Mistral Small",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.6000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-7b-instruct-v0.2",
      "name": "Mistral: Mistral 7B Instruct v0.2",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.2000",
        "completion_per_1m": "$0.2000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mixtral-8x7b-instruct",
      "name": "Mistral: Mixtral 8x7B Instruct",
      "context_length": 32768,
      "pricing": {
        "prompt_per_1m": "$0.5400",
        "completion_per_1m": "$0.5400"
      },
      "is_free": False
    },
    {
      "id": "neversleep/noromaid-20b",
      "name": "Noromaid 20B",
      "context_length": 4096,
      "pricing": {
        "prompt_per_1m": "$1.0000",
        "completion_per_1m": "$1.7500"
      },
      "is_free": False
    },
    {
      "id": "alpindale/goliath-120b",
      "name": "Goliath 120B",
      "context_length": 6144,
      "pricing": {
        "prompt_per_1m": "$6.0000",
        "completion_per_1m": "$8.0000"
      },
      "is_free": False
    },
    {
      "id": "openrouter/auto",
      "name": "Auto Router",
      "context_length": 2000000,
      "pricing": {
        "prompt_per_1m": "$-1000000.0000",
        "completion_per_1m": "$-1000000.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4-1106-preview",
      "name": "OpenAI: GPT-4 Turbo (older v1106)",
      "context_length": 128000,
      "pricing": {
        "prompt_per_1m": "$10.0000",
        "completion_per_1m": "$30.0000"
      },
      "is_free": False
    },
    {
      "id": "mistralai/mistral-7b-instruct-v0.1",
      "name": "Mistral: Mistral 7B Instruct v0.1",
      "context_length": 2824,
      "pricing": {
        "prompt_per_1m": "$0.1100",
        "completion_per_1m": "$0.1900"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-3.5-turbo-instruct",
      "name": "OpenAI: GPT-3.5 Turbo Instruct",
      "context_length": 4095,
      "pricing": {
        "prompt_per_1m": "$1.5000",
        "completion_per_1m": "$2.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-3.5-turbo-16k",
      "name": "OpenAI: GPT-3.5 Turbo 16k",
      "context_length": 16385,
      "pricing": {
        "prompt_per_1m": "$3.0000",
        "completion_per_1m": "$4.0000"
      },
      "is_free": False
    },
    {
      "id": "mancer/weaver",
      "name": "Mancer: Weaver (alpha)",
      "context_length": 8000,
      "pricing": {
        "prompt_per_1m": "$1.1250",
        "completion_per_1m": "$1.1250"
      },
      "is_free": False
    },
    {
      "id": "undi95/remm-slerp-l2-13b",
      "name": "ReMM SLERP 13B",
      "context_length": 6144,
      "pricing": {
        "prompt_per_1m": "$0.4500",
        "completion_per_1m": "$0.6500"
      },
      "is_free": False
    },
    {
      "id": "gryphe/mythomax-l2-13b",
      "name": "MythoMax 13B",
      "context_length": 4096,
      "pricing": {
        "prompt_per_1m": "$0.0600",
        "completion_per_1m": "$0.0600"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-3.5-turbo",
      "name": "OpenAI: GPT-3.5 Turbo",
      "context_length": 16385,
      "pricing": {
        "prompt_per_1m": "$0.5000",
        "completion_per_1m": "$1.5000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4",
      "name": "OpenAI: GPT-4",
      "context_length": 8191,
      "pricing": {
        "prompt_per_1m": "$30.0000",
        "completion_per_1m": "$60.0000"
      },
      "is_free": False
    },
    {
      "id": "openai/gpt-4-0314",
      "name": "OpenAI: GPT-4 (older v0314)",
      "context_length": 8191,
      "pricing": {
        "prompt_per_1m": "$30.0000",
        "completion_per_1m": "$60.0000"
      },
      "is_free": False
    }
  ]
}

models = models_data['models']

# Категории
categories = {
    'copper': [],
    'bronze': [],
    'silver': [],
    'gold': [],
    'platinum': []
}

for model in models:
    prompt_price = float(model['pricing']['prompt_per_1m'].replace('$', ''))
    completion_price = float(model['pricing']['completion_per_1m'].replace('$', ''))
    max_price = max(prompt_price, completion_price)  # Сортируем по максимальной цене
    model_id = model['id']
    name = model['name']

    if model['is_free']:
        categories['copper'].append({'id': model_id, 'name': name, 'price_in': prompt_price, 'price_out': completion_price})
    elif prompt_price < 0.2:
        categories['bronze'].append({'id': model_id, 'name': name, 'price_in': prompt_price, 'price_out': completion_price})
    elif prompt_price < 1.0:
        categories['silver'].append({'id': model_id, 'name': name, 'price_in': prompt_price, 'price_out': completion_price})
    elif prompt_price < 5.0:
        categories['gold'].append({'id': model_id, 'name': name, 'price_in': prompt_price, 'price_out': completion_price})
    else:
        categories['platinum'].append({'id': model_id, 'name': name, 'price_in': prompt_price, 'price_out': completion_price})

# Сохраняем в YAML файлы
import yaml

# Словарь для маппинга категорий на номера файлов
file_mapping = {
    'copper': '0-copper.yaml',
    'bronze': '1-bronze.yaml',
    'silver': '2-silver.yaml',
    'gold': '3-gold.yaml',
    'platinum': '4-platinum.yaml'
}

for category, models_list in categories.items():
    # Сортируем по цене выхода
    models_list.sort(key=lambda x: x['price_out'])

    # Добавляем заголовок
    header = f"# MCP-Factory Model Rankings - {category.title()}\n"
    if category == 'copper':
        header += "# Бесплатные модели (FREE) | Сортировка: по цене выхода токенов\n\n"
    elif category == 'bronze':
        header += "# Дешевые модели (< $0.2/1M токенов) | Сортировка: по цене выхода токенов\n\n"
    elif category == 'silver':
        header += "# Средние модели ($0.2-1.0/1M токенов) | Сортировка: по цене выхода токенов\n\n"
    elif category == 'gold':
        header += "# Хорошие модели ($1.0-5.0/1M токенов) | Сортировка: по цене выхода токенов\n\n"
    elif category == 'platinum':
        header += "# Премиум модели ($5.0+/1M токенов) | Сортировка: по цене выхода токенов\n\n"

    data = {'models': models_list}

    filename = file_mapping[category]
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(header)
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

print("Готово!")
