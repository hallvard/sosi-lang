grammar Sosi

entry Namespace: Package | Specification;

Package: 'package' NamespaceFragment;
Specification: 'specification' NamespaceFragment;

fragment NamespaceFragment:
  (description=STRING)?
  name = QName
  (tags += Tag)*
  (imports += Import)*
  (types += TypeDef)*;

Import:
  'import' namespace = [Namespace:QName];

Name returns string: (ID | STRING);

QName returns string:
  Name ('.' Name)*;

QName2 returns string:
  Name ('.' Name)+;

TypeDef: BuiltinType | CompositeType | EnumType;

CompositeType:
  (isAbstract ?= 'abstract')?
  (kind = ('data' | 'feature'))?
  'type'
  (description=STRING)?
  (name = Name)?
  ('extends' (extends += [CompositeType:QName]) (',' extends += [CompositeType:QName])*)?
  (tags += Tag)*
  '{'
    (properties += Property)+
  '}'
  ;

PropertyKind returns string: ('@' | '#' | '^');

PropertyType: TypeDef | TypeRef;

TypeRef: typeRef = [TypeDef:QName];

Property: (PropertyDef | PropertyRef);

PropertyDef:
  (description=STRING)?
  (kind = PropertyKind)?
  name = Name
  (multiplicity = Multiplicity)?
  ':'
  type = PropertyType
  (tags += Tag)*
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
  name = Name
  (mappings += DomainMapping)*
  (tags += Tag)*
  ;

DomainMapping:
  'as' domain = QName target = (QName | STRING);

EnumType:
  'codelist'
  (description=STRING)?
  (tags += Tag)*
  name = Name
  (mappings += DomainMapping)*
  '{'
    (properties += EnumProperty)+
  '}'
  ;

EnumProperty:
  (description=STRING)?
  name = Name
  ('=' label = EnumValue)?
  (tags += Tag)*
  ;

EnumValue: StringValue | IntValue | NameValue;

Tag: name = '$' QName ('!'? | ('=' value = LiteralValue));

LiteralValue: StringValue | UuidValue | DateValue | TimeValue | DecimalValue | IntValue | NameValue;

StringValue: value = STRING;
UuidValue: value = UUID;

DateValue: value = DateLiteral;
DateLiteral returns Date: INT '-' INT '-' INT;

TimeValue: value = TimeLiteral;
TimeLiteral returns Date: INT ':' INT (':' INT)? ('.' INT)?;

IntValue: value = IntLiteral;
IntLiteral returns number: INT;

DecimalValue: value = DecimalLiteral;
DecimalLiteral returns number: INT '.' INT;

NameValue: value = QName;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal UUID: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
terminal INT returns number: /[0-9]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
