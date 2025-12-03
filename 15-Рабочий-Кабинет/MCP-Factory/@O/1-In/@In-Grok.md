Welcome! In this guide, we'll walk you through the basics of using the xAI API.

Step 1: Create an xAI Account
First, you'll need to create an xAI account to access xAI API. Sign up for an account here.

Once you've created an account, you'll need to load it with credits to start using the API.

Step 2: Generate an API Key
Create an API key via the API Keys Page in the xAI API Console.

After generating an API key, we need to save it somewhere safe! We recommend you export it as an environment variable in your terminal or save it to a
.env
file.

Bash

export XAI_API_KEY="your_api_key"
Step 3: Make your first request
With your xAI API key exported as an environment variable, you're ready to make your first API request.

Let's test out the API using
curl
. Paste the following directly into your terminal.

Bash

curl https://api.x.ai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $XAI_API_KEY" \
-m 3600 \
-d '{
"messages": [
{
"role": "system",
"content": "You are Grok, a highly intelligent, helpful AI assistant."
},
{
"role": "user",
"content": "What is the meaning of life, the universe, and everything?"
}
],
"model": "grok-4",
"stream": false
}'
Step 4: Make a request from Python or Javascript
As well as a native xAI Python SDK, the majority our APIs are fully compatible with the OpenAI and Anthropic SDKs. For example, we can make the same request from Python or Javascript like so:

Python

Javascript
Other

# In your terminal, first run:

# pip install xai-sdk

import os
from xai_sdk import Client
from xai_sdk.chat import user, system
client = Client(
api_key=os.getenv("XAI_API_KEY"),
timeout=3600, # Override default timeout with longer timeout for reasoning models
)
chat = client.chat.create(model="grok-4")
chat.append(system("You are Grok, a highly intelligent, helpful AI assistant."))
chat.append(user("What is the meaning of life, the universe, and everything?"))
response = chat.sample()
print(response.content)
Certain models also support Structured Outputs, which allows you to enforce a schema for the LLM output.

For an in-depth guide about using Grok for text responses, check out our Chat Guide.

Step 5: Use Grok to analyze images
Certain grok models can accept both text AND images as an input. For example:

Python

Javascript
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user, image
client = Client(
api_key=os.getenv("XAI_API_KEY"),
timeout=3600, # Override default timeout with longer timeout for reasoning models
)
chat = client.chat.create(model="grok-4")
chat.append(
user(
"What's in this image?",
image("https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png")
)
)
response = chat.sample()
print(response.content)
And voila! Grok will tell you exactly what's in the image:

This image is a photograph of a region in space, specifically a part of the Carina Nebula, captured by the James Webb Space Telescope. It showcases a stunning view of interstellar gas and dust, illuminated by young, hot stars. The bright points of light are stars, and the colorful clouds are composed of various gases and dust particles. The image highlights the intricate details and beauty of star formation within a nebula.

To learn how to use Grok vision for more advanced use cases, check out our Image Understanding Guide.

Monitoring usage
As you use your API key, you will be charged for the number of tokens used. For an overview, you can monitor your usage on the xAI Console Usage Page.

If you want a more granular, per request usage tracking, the API response includes a usage object that provides detail on prompt (input) and completion (output) token usage.

JSON

"usage": {
"prompt_tokens":37,
"completion_tokens":530,
"total_tokens":800,
"prompt_tokens_details": {
"text_tokens":37,
"audio_tokens":0,
"image_tokens":0,
"cached_tokens":8
},
"completion_tokens_details": {
"reasoning_tokens":233,
"audio_tokens":0,
"accepted_prediction_tokens":0,
"rejected_prediction_tokens":0
},
"num_sources_used":0
}
If you send requests too frequently or with long prompts, you might run into rate limits and get an error response. For more information, read Consumption and Rate Limits.

Next steps
Now you have learned the basics of making an inference on xAI API. Check out Models page to start building with one of our latest models.

Text in, text out. Chat is the most popular feature on the xAI API, and can be used for anything from summarizing articles, generating creative writing, answering questions, providing customer support, to assisting with coding tasks.

Prerequisites
xAI Account: You need an xAI account to access the API.
API Key: Ensure that your API key has access to the chat endpoint and the chat model is enabled.
If you don't have these and are unsure of how to create one, follow the Hitchhiker's Guide to Grok.

You can create an API key on the xAI Console API Keys Page.

Set your API key in your environment:

Bash

export XAI_API_KEY="your_api_key"
A Basic Chat Completions Example
You can also stream the response, which is covered in Streaming Response.

The user sends a request to the xAI API endpoint. The API processes this and returns a complete response.

Python

Javascript
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user, system
client = Client(
api_key=os.getenv("XAI_API_KEY"),
timeout=3600, # Override default timeout with longer timeout for reasoning models
)
chat = client.chat.create(model="grok-4")
chat.append(system("You are a PhD-level mathematician."))
chat.append(user("What is 2 + 2?"))
response = chat.sample()
print(response.content)
Response:

Python

Javascript
Other

'2 + 2 equals 4.'
Conversations
The xAI API is stateless and does not process new request with the context of your previous request history.

However, you can provide previous chat generation prompts and results to a new chat generation request to let the model process your new request with the context in mind.

An example message:

JSON

{
"role": "system",
"content": [{ "type": "text", "text": "You are a helpful and funny assistant."}]
}
{
"role": "user",
"content": [{ "type": "text", "text": "Why don't eggs tell jokes?" }]
},
{
"role": "assistant",
"content": [{ "type": "text", "text": "They'd crack up!" }]
},
{
"role": "user",
"content": [{"type": "text", "text": "Can you explain the joke?"}],
}
By specifying roles, you can change how the model ingests the content. The
system
role content should define, in an instructive tone, the way the model should respond to user request. The
user
role content is usually used for user requests or data sent to the model. The
assistant
role content is usually either in the model's response, or when sent within the prompt, indicates the model's response as part of conversation history.

Message role order flexibility
Unlike some models from other providers, one of the unique aspects of xAI API is its flexibility with message role ordering:

No Order Limitation: You can mix
system
,
user
, or
assistant
roles in any order for your conversation context.
Example 1 - Multiple System Messages:

JSON

[
{ "role": "system", "content": "..." },
{ "role": "system", "content": "..." },
{ "role": "user", "content": "..." },
{ "role": "user", "content": "..." }
]
Example 2 - User Messages First:

JSON

[
{ "role": "user", "content": "..." },
{ "role": "user", "content": "..." },
{ "role": "system", "content": "..." }
]

Agentic search represents one of the most compelling applications of agentic tool calling, with
grok-4-1-fast
specifically trained to excel in this domain. Leveraging its speed and reasoning capabilities, the model iteratively calls search tools—analyzing responses and making follow-up queries as needed—to seamlessly navigate web pages and X posts, uncovering difficult-to-find information or insights that would otherwise require extensive human analysis.

xAI Python SDK Users: Version 1.3.1 of the xai-sdk package is required to use the agentic tool calling API.

Available Search Tools
You can use the following server-side search tools in your request:

Web Search - allows the agent to search the web and browse pages
X Search - allows the agent to perform keyword search, semantic search, user search, and thread fetch on X
You can customize which tools are enabled in a given request by listing the needed tools in the
tools
parameter in the request.

Tool xAI SDK OpenAI Responses API
Web Search
web_search
web_search
X Search
x_search
x_search
Retrieving Citations
Citations provide traceability for sources used during agentic search. Access them from the response object:

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import web_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[web_search()],
)
chat.append(user("What is xAI?"))
is_thinking = True
for response, chunk in chat.stream(): # View the server-side tool calls as they are being made in real-time
for tool_call in chunk.tool_calls:
print(f"\nCalling tool: {tool_call.function.name} with arguments: {tool_call.function.arguments}")
if response.usage.reasoning_tokens and is_thinking:
print(f"\rThinking... ({response.usage.reasoning_tokens} tokens)", end="", flush=True)
if chunk.content and is_thinking:
print("\n\nFinal Response:")
is_thinking = False
if chunk.content and not is_thinking:
print(chunk.content, end="", flush=True)
print("\n\nCitations:")
print(response.citations)
print("\n\nUsage:")
print(response.usage)
print(response.server_side_tool_usage)
print("\n\nServer Side Tool Calls:")
print(response.tool_calls)
As mentioned in the overview page, the citations array contains the URLs of all sources the agent encountered during its search process, meaning that not every URL here will necessarily be relevant to the final answer, as the agent may examine a particular source and determine it is not sufficiently relevant to the user's original query.

For complete details on citations, including when they're available and usage notes, see the overview page.

Applying Search Filters to Control Agentic Search
Each search tool supports a set of optional search parameters to help you narrow down the search space and limit the sources/information the agent is exposed to during its search process.

Tool Supported Filter Parameters
Web Search
allowed_domains
,
excluded_domains
,
enable_image_understanding
X Search
allowed_x_handles
,
excluded_x_handles
,
from_date
,
to_date
,
enable_image_understanding
,
enable_video_understanding
Web Search Parameters
Only Search in Specific Domains
Use
allowed_domains
to make the web search only perform the search and web browsing on web pages that fall within the specified domains.

allowed_domains
can include a maximum of five domains.

allowed_domains
cannot be set together with
excluded_domains
in the same request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import web_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
web_search(allowed_domains=["wikipedia.org"]),
],
)
chat.append(user("What is xAI?"))

# stream or sample the response...

Exclude Specific Domains
Use
excluded_domains
to prevent the model from including the specified domains in any web search tool invocations and from browsing any pages on those domains.

excluded_domains
can include a maximum of five domains.

excluded_domains
cannot be set together with
allowed_domains
in the same request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import web_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
web_search(excluded_domains=["wikipedia.org"]),
],
)
chat.append(user("What is xAI?"))

# stream or sample the response...

Enable Image Understanding
Setting
enable_image_understanding
to true equips the agent with access to the
view_image
tool, allowing it to invoke this tool on any image URLs encountered during the search process. The model can then interpret and analyze image contents, incorporating this visual information into its context to potentially influence the trajectory of follow-up tool calls.

When the model invokes this tool, you will see it as an entry in
chunk.tool_calls
and
response.tool_calls
with the
image_url
as a parameter. Additionally,
SERVER_SIDE_TOOL_VIEW_IMAGE
will appear in
response.server_side_tool_usage
along with the number of times it was called when using the xAI Python SDK.

Note that enabling this feature increases token usage, as images are processed and represented as image tokens in the model's context.

Enabling this parameter for Web Search will also enable the image understanding for X Search tool if it's also included in the request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import web_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
web_search(enable_image_understanding=True),
],
)
chat.append(user("What is included in the image in xAI's official website?"))

# stream or sample the response...

X Search Parameters
Only Consider X Posts from Specific Handles
Use
allowed_x_handles
to consider X posts only from a given list of X handles. The maximum number of handles you can include is 10.

allowed_x_handles
cannot be set together with
excluded_x_handles
in the same request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
x_search(allowed_x_handles=["elonmusk"]),
],
)
chat.append(user("What is the current status of xAI?"))

# stream or sample the response...

Exclude X Posts from Specific Handles
Use
excluded_x_handles
to prevent the model from including X posts from the specified handles in any X search tool invocations. The maximum number of handles you can exclude is 10.

excluded_x_handles
cannot be set together with
allowed_x_handles
in the same request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
x_search(excluded_x_handles=["elonmusk"]),
],
)
chat.append(user("What is the current status of xAI?"))

# stream or sample the response...

Date Range
You can restrict the date range of search data used by specifying
from_date
and
to_date
. This limits the data to the period from
from_date
to
to_date
, including both dates.

Both fields need to be in ISO8601 format, e.g., "YYYY-MM-DD". If you're using the xAI Python SDK, the
from_date
and
to_date
fields can be passed as
datetime.datetime
objects.

The fields can also be used independently. With only
from_date
specified, the data used will be from the
from_date
to today, and with only
to_date
specified, the data used will be all data until the
to_date
.

Python
Other

import os
from datetime import datetime
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
x_search(
from_date=datetime(2025, 10, 1),
to_date=datetime(2025, 10, 10),
),
],
)
chat.append(user("What is the current status of xAI?"))

# stream or sample the response...

Enable Image Understanding
Setting
enable_image_understanding
to true equips the agent with access to the
view_image
tool, allowing it to invoke this tool on any image URLs encountered during the search process. The model can then interpret and analyze image contents, incorporating this visual information into its context to potentially influence the trajectory of follow-up tool calls.

When the model invokes this tool, you will see it as an entry in
chunk.tool_calls
and
response.tool_calls
with the
image_url
as a parameter. Additionally,
SERVER_SIDE_TOOL_VIEW_IMAGE
will appear in
response.server_side_tool_usage
along with the number of times it was called when using the xAI Python SDK.

Note that enabling this feature increases token usage, as images are processed and represented as image tokens in the model's context.

Enabling this parameter for X Search will also enable the image understanding for Web Search tool if it's also included in the request.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
x_search(enable_image_understanding=True),
],
)
chat.append(user("What images are being shared in recent xAI posts?"))

# stream or sample the response...

Enable Video Understanding
Setting
enable_video_understanding
to true equips the agent with access to the
view_x_video
tool, allowing it to invoke this tool on any video URLs encountered in X posts during the search process. The model can then analyze video content, incorporating this information into its context to potentially influence the trajectory of follow-up tool calls.

When the model invokes this tool, you will see it as an entry in
chunk.tool_calls
and
response.tool_calls
with the
video_url
as a parameter. Additionally,
SERVER_SIDE_TOOL_VIEW_X_VIDEO
will appear in
response.server_side_tool_usage
along with the number of times it was called when using the xAI Python SDK.

Note that enabling this feature increases token usage, as video content is processed and represented as tokens in the model's context.

Python
Other

import os
from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search
client = Client(api_key=os.getenv("XAI_API_KEY"))
chat = client.chat.create(
model="grok-4-1-fast", # reasoning model
tools=[
x_search(enable_video_understanding=True),
],
)
chat.append(user("What is the latest video talking about from the xAI official X account?"))

# stream or sample the response...
