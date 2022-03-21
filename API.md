# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### EzConstruct <a name="EzConstruct" id="ez-constructs.EzConstruct"></a>

A marker base class for EzConstructs.

#### Initializers <a name="Initializers" id="ez-constructs.EzConstruct.Initializer"></a>

```typescript
import { EzConstruct } from 'ez-constructs'

new EzConstruct(scope: Construct, id: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#ez-constructs.EzConstruct.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#ez-constructs.EzConstruct.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="ez-constructs.EzConstruct.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="ez-constructs.EzConstruct.Initializer.parameter.id"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.EzConstruct.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="ez-constructs.EzConstruct.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.





## Classes <a name="Classes" id="Classes"></a>

### Utils <a name="Utils" id="ez-constructs.Utils"></a>

A utility class that have common functions.

#### Initializers <a name="Initializers" id="ez-constructs.Utils.Initializer"></a>

```typescript
import { Utils } from 'ez-constructs'

new Utils()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#ez-constructs.Utils.appendIfNecessary">appendIfNecessary</a></code> | Will append the suffix to the given name if the name do not contain the suffix. |
| <code><a href="#ez-constructs.Utils.endsWith">endsWith</a></code> | Will check if the given string ends with the given suffix. |
| <code><a href="#ez-constructs.Utils.isEmpty">isEmpty</a></code> | Will check if the given object is empty. |
| <code><a href="#ez-constructs.Utils.kebabCase">kebabCase</a></code> | Will convert the given string to lower case and transform any spaces to hyphens. |
| <code><a href="#ez-constructs.Utils.parseGithubUrl">parseGithubUrl</a></code> | Splits a given Github URL and extracts the owner and repo name. |
| <code><a href="#ez-constructs.Utils.prettyPrintStack">prettyPrintStack</a></code> | A utility function that will print the content of a CDK stack. |
| <code><a href="#ez-constructs.Utils.startsWith">startsWith</a></code> | Will check if the given string starts with the given prefix. |
| <code><a href="#ez-constructs.Utils.wrap">wrap</a></code> | Will wrap the given string using the given delimiter. |

---

##### `appendIfNecessary` <a name="appendIfNecessary" id="ez-constructs.Utils.appendIfNecessary"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.appendIfNecessary(name: string, suffixes: string)
```

Will append the suffix to the given name if the name do not contain the suffix.

###### `name`<sup>Required</sup> <a name="name" id="ez-constructs.Utils.appendIfNecessary.parameter.name"></a>

- *Type:* string

a string.

---

###### `suffixes`<sup>Required</sup> <a name="suffixes" id="ez-constructs.Utils.appendIfNecessary.parameter.suffixes"></a>

- *Type:* string

the string to append.

---

##### `endsWith` <a name="endsWith" id="ez-constructs.Utils.endsWith"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.endsWith(str: string, s: string)
```

Will check if the given string ends with the given suffix.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.endsWith.parameter.str"></a>

- *Type:* string

a string.

---

###### `s`<sup>Required</sup> <a name="s" id="ez-constructs.Utils.endsWith.parameter.s"></a>

- *Type:* string

suffix to check.

---

##### `isEmpty` <a name="isEmpty" id="ez-constructs.Utils.isEmpty"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.isEmpty(value?: any)
```

Will check if the given object is empty.

###### `value`<sup>Optional</sup> <a name="value" id="ez-constructs.Utils.isEmpty.parameter.value"></a>

- *Type:* any

---

##### `kebabCase` <a name="kebabCase" id="ez-constructs.Utils.kebabCase"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.kebabCase(str: string)
```

Will convert the given string to lower case and transform any spaces to hyphens.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.kebabCase.parameter.str"></a>

- *Type:* string

a string.

---

##### `parseGithubUrl` <a name="parseGithubUrl" id="ez-constructs.Utils.parseGithubUrl"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.parseGithubUrl(url: string)
```

Splits a given Github URL and extracts the owner and repo name.

###### `url`<sup>Required</sup> <a name="url" id="ez-constructs.Utils.parseGithubUrl.parameter.url"></a>

- *Type:* string

---

##### `prettyPrintStack` <a name="prettyPrintStack" id="ez-constructs.Utils.prettyPrintStack"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.prettyPrintStack(stack: Stack)
```

A utility function that will print the content of a CDK stack.

###### `stack`<sup>Required</sup> <a name="stack" id="ez-constructs.Utils.prettyPrintStack.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

a valid stack.

---

##### `startsWith` <a name="startsWith" id="ez-constructs.Utils.startsWith"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.startsWith(str: string, s: string)
```

Will check if the given string starts with the given prefix.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.startsWith.parameter.str"></a>

- *Type:* string

a string.

---

###### `s`<sup>Required</sup> <a name="s" id="ez-constructs.Utils.startsWith.parameter.s"></a>

- *Type:* string

the prefix to check.

---

##### `wrap` <a name="wrap" id="ez-constructs.Utils.wrap"></a>

```typescript
import { Utils } from 'ez-constructs'

Utils.wrap(str: string, delimiter: string)
```

Will wrap the given string using the given delimiter.

###### `str`<sup>Required</sup> <a name="str" id="ez-constructs.Utils.wrap.parameter.str"></a>

- *Type:* string

the string to wrap.

---

###### `delimiter`<sup>Required</sup> <a name="delimiter" id="ez-constructs.Utils.wrap.parameter.delimiter"></a>

- *Type:* string

the delimiter to use.

---




