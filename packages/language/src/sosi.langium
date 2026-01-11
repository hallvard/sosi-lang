grammar Sosi

entry Namespace: Package | Specification;

Package: 'package' NamespaceFragment;
Specification: 'specification' NamespaceFragment;

fragment NamespaceFragment:
  (description=STRING)?
  (tags += Tag)*
  name = QName
  (imports += Import)*
  (types += TypeDef)*;

Import:
  'import' namespace = [Namespace:QName];

Name returns string: (ID | STRING);

QName returns string:
  Name ('.' Name)*;

QName2 returns string:
  Name ('.' Name)+;

TypeDef: BuiltinType | CompositeType;

CompositeType:
  (isAbstract ?= 'abstract')?
  (kind = ('data' | 'feature'))?
  'type'
  (description=STRING)?
  (tags += Tag)*
  (name = Name)?
  ('extends' (extends += [TypeDef:QName]) (',' extends += [TypeDef:QName])*)?
  '{'
    (properties += Property)+
  '}'
  (mappings += DomainMapping)*
  ;

PropertyKind returns string: ('@' | '#' | '^');

PropertyType: TypeDef | TypeRef;

TypeRef: typeRef = [TypeDef:QName];

Property: (PropertyDef | PropertyRef);

PropertyDef:
  (description=STRING)?
  (tags += Tag)*
  (kind = PropertyKind)?
  name = Name
  (multiplicity = Multiplicity)?
  ':'
  type = PropertyType
  (mappings += DomainMapping)*
  ;

PropertyRef:
  propertyRef = [PropertyDef:QName2]
  (multiplicity = Multiplicity)?;

Multiplicity: ZeroOrMoreMultiplicity | OneOrMoreMultiplicity | ZeroOrOneMultiplicity | SomeMultiplicity;

ZeroOrMoreMultiplicity: spec = '*';
OneOrMoreMultiplicity: spec = '+';
ZeroOrOneMultiplicity: spec = '?';
SomeMultiplicity: lower = '[' INT ('..' (upper = INT)?) ']';

BuiltinType:
  'builtin'
  (description=STRING)?
  (tags += Tag)*
  name = Name
  (mappings += DomainMapping)*
  ;

DomainMapping:
  'as' domain = QName target = (QName | STRING);

Tag: tagName = QName ('!' | ('=' tagValue = LiteralValue));

LiteralValue: StringValue | UuidValue | DateValue | TimeValue | DecimalValue | IntValue | NameValue;

StringValue: value = STRING;
UuidValue: value = UUID;
DateValue: value = INT '-' INT '-' INT;
TimeValue: value = INT ':' INT (':' INT)? ('.' INT)?;
IntValue: value = INT;
DecimalValue: value = INT '.' INT;
NameValue: value = QName;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal UUID: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
