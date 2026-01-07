grammar Sosi

entry Namespace: Package | Specification;

Package: 'package' NamespaceFragment;
Specification: 'specification' NamespaceFragment;

fragment NamespaceFragment:
  (description=STRING)? name = QName
  (imports += Import)*
  (types += Type)*;

Import:
  'import' namespace = [Namespace:QName];

Name returns string: (ID | STRING);

QName returns string:
  Name ('.' Name)*;

Type: BuiltinType | CompositeType;

CompositeType:
  (isAbstract ?= 'abstract')?
  (kind = ('data' | 'feature'))?
  'type'
  (description=STRING)?
  (name = Name)?
  ('extends' (extends += [Type:QName]) (',' extends += [Type:QName])*)?
  '{'
    (properties += Property)+
  '}'
  (mappings += DomainMapping)*
  ;

PropertyKind returns string: ('@' | '#' | '^');

PropertyType: TypeRef | InlineType;

TypeRef: typeRef = [Type:QName];
InlineType: typeDef = Type;

Property:
  (kind = PropertyKind)?
  (description=STRING)?
  name = Name
  (multiplicity = Multiplicity)? ':'
  type = PropertyType
  (mappings += DomainMapping)*
  ;

Multiplicity: ZeroOrMoreMultiplicity | OneOrMoreMultiplicity | ZeroOrOneMultiplicity | SomeMultiplicity;

ZeroOrMoreMultiplicity: spec = '*';
OneOrMoreMultiplicity: spec = '+';
ZeroOrOneMultiplicity: spec = '?';
SomeMultiplicity: lower = '[' INT ('..' (upper = INT)?) ']';

BuiltinType:
  'builtin' (name = Name)?
  (mappings += DomainMapping)*
  ;

DomainMapping:
  'as' domain = QName target = (QName | STRING);

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
