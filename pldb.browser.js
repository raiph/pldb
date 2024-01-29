{


class abstractTrueBaseColumnParser extends GrammarBackedNode {
      get columnNameCell() {
      return this.getWord(0)
    }
get isColumn() { return true }
get typeForCsvDocs() { return `unspecified` }
get columnValue() {
 return this.content
}
get columnName() {
 return this.definition.cruxPathAsColumnName
}
    }

class abstractUrlColumnParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get urlCell() {
      return this.getWord(1)
    }
get typeForCsvDocs() { return `url` }
    }

class annualReportsUrlParser extends abstractUrlColumnParser {
      
    }

class abstractUrlGuidColumnParser extends abstractUrlColumnParser {
      
    }

class antlrParser extends abstractUrlGuidColumnParser {
      get sourceDomain() { return `www.antlr.org` }
    }

class hoplParser extends abstractUrlGuidColumnParser {
      get sourceDomain() { return `hopl.info` }
    }

class jupyterKernelParser extends abstractUrlGuidColumnParser {
      get sourceDomain() { return `jupyter.org` }
    }

class meetupParser extends abstractUrlGuidColumnParser {
      createParserCombinator() {class memberCountParser extends abstractPopulationCountColumnParser {
      
    }

class groupCountParser extends abstractCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"memberCount" : memberCountParser,
"groupCount" : groupCountParser}), undefined)
  }
get sourceDomain() { return `meetup.com` }
    }

class subredditParser extends abstractUrlGuidColumnParser {
      createParserCombinator() {class memberCountParser extends abstractAnnualPopulationCountMapParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"memberCount" : memberCountParser}), undefined)
  }
get sourceDomain() { return `reddit.com` }
    }

class replitParser extends abstractUrlGuidColumnParser {
      get sourceDomain() { return `replit.com` }
    }

class rosettaCodeParser extends abstractUrlGuidColumnParser {
      get sourceDomain() { return `rosettacode.org` }
    }

class twitterParser extends abstractUrlGuidColumnParser {
      createParserCombinator() {class followersParser extends abstractPopulationCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"followers" : followersParser}), undefined)
  }
get sourceDomain() { return `twitter.com` }
    }

class abstractChatUrlColumnParser extends abstractUrlColumnParser {
      get sortKey() { return `abstractChatUrlColumnParser` }
    }

class discordParser extends abstractChatUrlColumnParser {
      
    }

class discourseParser extends abstractChatUrlColumnParser {
      
    }

class ircParser extends abstractChatUrlColumnParser {
      
    }

class zulipParser extends abstractChatUrlColumnParser {
      
    }

class cheatSheetUrlParser extends abstractUrlColumnParser {
      
    }

class conferenceParser extends abstractUrlColumnParser {
      get conferenceNameCell() {
      return this.getWordsFrom(0)
    }
    }

class demoVideoParser extends abstractUrlColumnParser {
      
    }

class documentationParser extends abstractUrlColumnParser {
      
    }

class devDocumentationParser extends abstractUrlColumnParser {
      
    }

class downloadPageUrlParser extends abstractUrlColumnParser {
      
    }

class ebookParser extends abstractUrlColumnParser {
      
    }

class emailListParser extends abstractUrlColumnParser {
      
    }

class esolangParser extends abstractUrlColumnParser {
      get sourceDomain() { return `esolangs.org` }
    }

class eventsPageUrlParser extends abstractUrlColumnParser {
      
    }

class faqPageUrlParser extends abstractUrlColumnParser {
      
    }

class abstractGitRepoUrlColumnParser extends abstractUrlColumnParser {
      get sortKey() { return `abstractGitRepoUrlColumnParser` }
    }

class gitRepoParser extends abstractGitRepoUrlColumnParser {
      
    }

class githubRepoParser extends abstractGitRepoUrlColumnParser {
      createParserCombinator() {class createdParser extends abstractYearColumnParser {
      
    }

class updatedParser extends abstractYearColumnParser {
      
    }

class firstCommitParser extends abstractYearColumnParser {
      
    }

class subscribersParser extends abstractCountColumnParser {
      
    }

class forksParser extends abstractCountColumnParser {
      
    }

class starsParser extends abstractCountColumnParser {
      
    }

class issuesParser extends abstractCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"description" : descriptionParser,
"created" : createdParser,
"updated" : updatedParser,
"firstCommit" : firstCommitParser,
"subscribers" : subscribersParser,
"forks" : forksParser,
"stars" : starsParser,
"issues" : issuesParser}), undefined)
  }
get columnNameCell() {
      return this.getWord(0)
    }
get githubRepoUrlCell() {
      return this.getWord(1)
    }
get sourceDomain() { return `github.com` }
    }

class gitlabRepoParser extends abstractGitRepoUrlColumnParser {
      get sourceDomain() { return `gitlab.com` }
    }

class sourcehutRepoParser extends abstractGitRepoUrlColumnParser {
      get sourceDomain() { return `sr.ht` }
    }

class gourceParser extends abstractUrlColumnParser {
      get sourceDomain() { return `gource.io` }
    }

class firstAnnouncementParser extends abstractUrlColumnParser {
      
    }

class screenshotParser extends abstractUrlColumnParser {
      
    }

class photoParser extends abstractUrlColumnParser {
      
    }

class languageServerProtocolProjectParser extends abstractUrlColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"writtenIn" : writtenInParser}), undefined)
  }
get sourceDomain() { return `langserver.org` }
    }

class linguistGrammarRepoParser extends abstractUrlColumnParser {
      createParserCombinator() {class commitCountParser extends abstractCountColumnParser {
      
    }

class firstCommitParser extends abstractYearColumnParser {
      
    }

class lastCommitParser extends abstractYearColumnParser {
      
    }

class sampleCountParser extends abstractCountColumnParser {
      
    }

class committerCountParser extends abstractPopulationCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser,
"commitCount" : commitCountParser,
"firstCommit" : firstCommitParser,
"lastCommit" : lastCommitParser,
"sampleCount" : sampleCountParser,
"committerCount" : committerCountParser}), undefined)
  }
get columnNameCell() {
      return this.getWord(0)
    }
get urlCell() {
      return this.getWord(1)
    }
get sourceDomain() { return `github.com` }
    }

class officialBlogUrlParser extends abstractUrlColumnParser {
      
    }

class packageRepositoryParser extends abstractUrlColumnParser {
      
    }

class proposalsParser extends abstractUrlColumnParser {
      
    }

class redditDiscussionParser extends abstractUrlColumnParser {
      get sourceDomain() { return `reddit.com` }
    }

class referenceParser extends abstractUrlColumnParser {
      
    }

class releaseNotesUrlParser extends abstractUrlColumnParser {
      
    }

class rijuReplParser extends abstractUrlColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"gitRepo" : gitRepoParser,
"website" : websiteParser,
"description" : descriptionParser,
"fileExtensions" : fileExtensionsParser,
"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser}), undefined)
  }
get sourceDomain() { return `riju.codes` }
    }

class roadmapParser extends abstractUrlColumnParser {
      
    }

class specParser extends abstractUrlColumnParser {
      
    }

class websiteParser extends abstractUrlColumnParser {
      
    }

class webReplParser extends abstractUrlColumnParser {
      
    }

class wikipediaParser extends abstractUrlColumnParser {
      createParserCombinator() {class relatedParser extends abstractTrueBaseLinksColumnParser {
      
    }

class summaryParser extends abstractStringColumnParser {
      
    }

class createdParser extends abstractYearColumnParser {
      
    }

class appearedParser extends abstractYearColumnParser {
      
    }

class dailyPageViewsParser extends abstractCountColumnParser {
      
    }

class backlinksCountParser extends abstractCountColumnParser {
      
    }

class revisionCountParser extends abstractCountColumnParser {
      
    }

class pageIdParser extends abstractIntColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"fileExtensions" : fileExtensionsParser,
"related" : relatedParser,
"appeared" : appearedParser,
"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser,
"summary" : summaryParser,
"created" : createdParser,
"dailyPageViews" : dailyPageViewsParser,
"backlinksCount" : backlinksCountParser,
"revisionCount" : revisionCountParser,
"pageId" : pageIdParser}), undefined)
  }
get columnNameCell() {
      return this.getWord(0)
    }
get urlCell() {
      return this.getWord(1)
    }
get sourceDomain() { return `wikipedia.org` }
    }

class abstractBooleanColumnParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get boolCell() {
      return this.getWord(1)
    }
get typeForCsvDocs() { return `boolean` }
    }

class abstractFeatureParser extends abstractBooleanColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(featureExampleCodeParser, undefined, undefined)
  }
get sortKey() { return `abstractFeatureParser` }
    }

class canDoShebangParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Shebang_(Unix)` }
get pseudoExample() { return `#! /run` }
get title() { return `Shebang` }
    }

class canReadCommandLineArgsParser extends abstractFeatureParser {
      
    }

class canUseQuestionMarksAsPartOfIdentifierParser extends abstractFeatureParser {
      
    }

class canWriteToDiskParser extends abstractFeatureParser {
      get pseudoExample() { return `write("pldb.csv", "...")` }
get title() { return `Disk Output` }
    }

class hasAbstractTypesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Abstract_type` }
get pseudoExample() { return `abstract class PLDBFile {}` }
get title() { return `Abstract Types` }
    }

class hasAccessModifiersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Access_modifiers` }
get pseudoExample() { return `class PLDBFile { public title }` }
get title() { return `Access Modifiers` }
    }

class hasAlgebraicTypesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Algebraic_data_type` }
get pseudoExample() { return `garageContents = empty | vehicle` }
get title() { return `Algebraic Data Type` }
    }

class hasAnonymousFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Anonymous_function` }
get pseudoExample() { return `() => printPldb()` }
get aka() { return `Lambdas` }
get title() { return `Anonymous Functions` }
    }

class hasArraySlicingSyntaxParser extends abstractFeatureParser {
      
    }

class hasAssertStatementsParser extends abstractFeatureParser {
      get pseudoExample() { return `assert(isTrue)` }
get reference() { return `https://en.wikipedia.org/wiki/Debug_code#Assert_Statements` }
get title() { return `Assert Statements` }
    }

class hasAssignmentParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Assignment_(computer_science)` }
get tokenKeyword() { return `assignmentToken` }
get pseudoExample() { return `name = "PLDB"` }
get title() { return `Assignment` }
    }

class hasAsyncAwaitParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Async/await` }
get pseudoExample() { return `async downloadPldb => await getFiles()` }
get title() { return `Async Await` }
    }

class hasBinaryNumbersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Binary_number` }
get pseudoExample() { return `0b100110100000110011110010010` }
get title() { return `Binary Literals` }
    }

class hasBinaryOperatorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Binary_operation` }
get pseudoExample() { return `1 + 1` }
get title() { return `Binary Operators` }
    }

class hasBitWiseOperatorsParser extends abstractFeatureParser {
      get pseudoExample() { return `3 == (2 | 1)` }
get reference() { return `https://en.wikipedia.org/wiki/Bitwise_operations_in_C https://en.wikipedia.org/wiki/Bitwise_operation` }
get title() { return `Bitwise Operators` }
    }

class hasBlobsParser extends abstractFeatureParser {
      
    }

class hasBooleansParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Boolean_data_type` }
get tokenKeyword() { return `booleanTokens` }
get pseudoExample() { return `pldb = true` }
get title() { return `Booleans` }
    }

class hasBoundedCheckedArraysParser extends abstractFeatureParser {
      
    }

class hasBreakParser extends abstractFeatureParser {
      
    }

class hasBuiltInRegexParser extends abstractFeatureParser {
      
    }

class hasCaseInsensitiveIdentifiersParser extends abstractFeatureParser {
      get pseudoExample() { return `pLdB = "PLDB"` }
get reference() { return `https://rosettacode.org/wiki/Case-sensitivity_of_identifiers` }
get title() { return `Case Insensitive Identifiers` }
    }

class hasCharactersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Character_(computing)` }
get pseudoExample() { return `char character = 'P';` }
get title() { return `Characters` }
    }

class hasClassesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Class_(computer_programming)` }
get pseudoExample() { return `class PLDBFile {}` }
get title() { return `Classes` }
    }

class hasClobsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Character_large_object` }
get pseudoExample() { return `class PLDBFile {}` }
get aka() { return `Character large objects` }
get title() { return `Clobs` }
    }

class hasCommentsParser extends abstractFeatureParser {
      get pseudoExample() { return `# Hello PLDB` }
get reference() { return `https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments https://en.wikipedia.org/wiki/Comment_(computer_programming)` }
get title() { return `Comments` }
    }

class hasConditionalsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Conditional_(computer_programming)` }
get pseudoExample() { return `if (isTrue) printPldb()` }
get title() { return `Conditionals` }
    }

class hasConstantsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Const_(computer_programming)` }
get pseudoExample() { return `const name = "PLDB"` }
get title() { return `Constants` }
    }

class hasConstructorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Constructor_(object-oriented_programming)` }
get pseudoExample() { return `PLDBFile { constructor() {} }` }
get title() { return `Constructors` }
    }

class hasContinueParser extends abstractFeatureParser {
      
    }

class hasDecimalsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Decimal_data_type` }
get pseudoExample() { return `0.80766866` }
get title() { return `Decimals` }
    }

class hasDefaultParametersParser extends abstractFeatureParser {
      get pseudoExample() { return `say(message = "Hello PLDB")` }
get reference() { return `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters` }
get title() { return `Default Parameters Pattern` }
    }

class hasDependentTypesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Dependent_type` }
get pseudoExample() { return `pldbSortedList // a list where is sorted is true` }
get title() { return `Dependent types` }
    }

class hasDestructuringParser extends abstractFeatureParser {
      get pseudoExample() { return `{title, rank} = pldbFile` }
get reference() { return `https://reasonml.github.io/docs/en/destructuring` }
get website() { return `https://github.com/facebook/reason` }
get title() { return `Destructuring` }
    }

class hasDirectivesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Directive_(programming)` }
get pseudoExample() { return `use strict;` }
get title() { return `Directives` }
    }

class hasDisposeBlocksParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Dispose_pattern` }
get pseudoExample() { return `with pldb: do computeRanks()` }
get title() { return `Dispose Blocks Pattern` }
    }

class hasDocCommentsParser extends abstractFeatureParser {
      get pseudoExample() { return `// param1: A comment about the first param` }
get title() { return `Doc comments` }
    }

class hasDuckTypingParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Duck_typing` }
get pseudoExample() { return `length() // makes me an iterator` }
get title() { return `Duck Typing` }
    }

class hasDynamicPropertiesParser extends abstractFeatureParser {
      get pseudoExample() { return `pldb.score = 50` }
get title() { return `Dynamic Properties` }
    }

class hasDynamicSizedArraysParser extends abstractFeatureParser {
      
    }

class hasDynamicTypingParser extends abstractFeatureParser {
      
    }

class hasEnumsParser extends abstractFeatureParser {
      get pseudoExample() { return `colorsEnum { "red", "white", "blue"}` }
get reference() { return `https://en.wikipedia.org/wiki/Enumerated_type` }
get title() { return `Enums` }
    }

class hasEscapeCharactersParser extends abstractFeatureParser {
      
    }

class hasExceptionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Exception_handling` }
get pseudoExample() { return `throw new Error("PLDB uh oh")` }
get title() { return `Exceptions` }
    }

class hasExplicitTypeCastingParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Type_conversion` }
get pseudoExample() { return `(float)pldbRank;` }
get title() { return `Type Casting` }
    }

class hasExportsParser extends abstractFeatureParser {
      
    }

class hasExpressionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Expression_(computer_science)` }
get pseudoExample() { return `(1 + 2)` }
get title() { return `Expressions` }
    }

class hasFirstClassFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/First-class_function` }
get pseudoExample() { return `[2.1].map(Math.round)` }
get title() { return `First-Class Functions` }
    }

class hasFixedPointParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Fixed-point_arithmetic` }
get pseudoExample() { return `80766866.00` }
get title() { return `Fixed Point Numbers` }
    }

class hasFloatsParser extends abstractFeatureParser {
      get pseudoExample() { return `80766866.0` }
get reference() { return `https://evanw.github.io/float-toy/ https://en.wikipedia.org/wiki/Floating-point_arithmetic` }
get title() { return `Floats` }
    }

class hasFnArgumentsParser extends abstractFeatureParser {
      
    }

class hasForEachLoopsParser extends abstractFeatureParser {
      
    }

class hasForLoopsParser extends abstractFeatureParser {
      
    }

class hasFunctionCompositionParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Function_composition_(computer_science)` }
get pseudoExample() { return `o = (f, g) => x => f(g(x))` }
get title() { return `Function Composition` }
    }

class hasFunctionOverloadingParser extends abstractFeatureParser {
      get pseudoExample() { return `add(string: str, string2: str)` }
get aka() { return `Ad hoc polymorphism` }
get reference() { return `https://en.wikibooks.org/wiki/Introduction_to_Programming_Languages/Overloading https://en.wikipedia.org/wiki/Function_overloading` }
get title() { return `Function Overloading` }
    }

class hasFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Subroutine` }
get pseudoExample() { return `function computePLDBRanks() {}` }
get aka() { return `routines` }
get title() { return `Functions` }
    }

class hasGarbageCollectionParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)` }
get pseudoExample() { return `var iDontNeedToFreeThis` }
get title() { return `Garbage Collection` }
    }

class hasGeneratorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Generator_(computer_programming)` }
get pseudoExample() { return `yield 2` }
get title() { return `Generators` }
    }

class hasGenericsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Generic_programming` }
get pseudoExample() { return `function identity<T>(arg: T): T` }
get title() { return `Generics` }
    }

class hasGlobalScopeParser extends abstractFeatureParser {
      
    }

class hasGotosParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Goto` }
get pseudoExample() { return `goto 10` }
get title() { return `Gotos` }
    }

class hasHereDocsParser extends abstractFeatureParser {
      get pseudoExample() { return `\`A big multliline text block\`` }
get reference() { return `https://en.wikipedia.org/wiki/Here_document` }
get title() { return `Here Document` }
    }

class hasHexadecimalsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Hexadecimal` }
get pseudoExample() { return `0x4D06792` }
get aka() { return `Base16` }
get title() { return `Hexadecimals` }
    }

class hasHomoiconicityParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Homoiconicity` }
get pseudoExample() { return `(list ())` }
get title() { return `Homoiconicity` }
    }

class hasIdsParser extends abstractFeatureParser {
      
    }

class hasIfElsesParser extends abstractFeatureParser {
      
    }

class hasIfsParser extends abstractFeatureParser {
      
    }

class hasImplicitArgumentsParser extends abstractFeatureParser {
      get pseudoExample() { return `shout(implicit message: string)` }
get reference() { return `https://docs.scala-lang.org/tour/implicit-parameters.html` }
get title() { return `Implicit Arguments` }
    }

class hasImplicitTypeConversionsParser extends abstractFeatureParser {
      get pseudoExample() { return `console.log("hello " + 2)` }
get reference() { return `https://en.wikipedia.org/wiki/Type_conversion` }
get title() { return `Implicit Type Casting` }
    }

class hasImportsParser extends abstractFeatureParser {
      get tokenKeyword() { return `includeToken` }
get pseudoExample() { return `import pldb` }
get title() { return `File Imports` }
    }

class hasIncrementAndDecrementOperatorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Increment_and_decrement_operators` }
get pseudoExample() { return `i++` }
get title() { return `Increment and decrement operators` }
    }

class hasInfixNotationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Infix_notation` }
get pseudoExample() { return `1 + 2` }
get title() { return `Infix Notation` }
    }

class hasInheritanceParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)` }
get pseudoExample() { return `class PLDBFile extends File` }
get title() { return `Inheritance` }
    }

class hasIntegersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Integer_(computer_science)` }
get pseudoExample() { return `80766866` }
get title() { return `Integers` }
    }

class hasInterfacesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Protocol_(object-oriented_programming)` }
get pseudoExample() { return `interface PLDBFile` }
get title() { return `Interfaces` }
    }

class hasIteratorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Iterator` }
get pseudoExample() { return `for lang in pldb()` }
get title() { return `Iterators` }
    }

class hasLabelsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Label_(computer_science)` }
get pseudoExample() { return `mainFn:` }
get title() { return `Labels` }
    }

class hasLazyEvaluationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Lazy_evaluation` }
get pseudoExample() { return `print(range(1000000)[2])` }
get title() { return `Lazy Evaluation` }
    }

class hasLineCommentsParser extends abstractFeatureParser {
      get tokenKeyword() { return `lineCommentToken` }
get pseudoExample() { return `# Hello PLDB` }
get reference() { return `https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments` }
get title() { return `Line Comments` }
    }

class hasListsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/List_(abstract_data_type)` }
get pseudoExample() { return `[2, 3, 10]` }
get aka() { return `array` }
get title() { return `Lists` }
    }

class hasMacrosParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Macro_(computer_science)` }
get pseudoExample() { return `#define pldbItems 4000` }
get title() { return `Macros` }
    }

class hasMagicGettersAndSettersParser extends abstractFeatureParser {
      get pseudoExample() { return `get(name) => obj[name]` }
get reference() { return `https://www.php.net/manual/en/language.oop5.overloading.php#object.get` }
get title() { return `Magic Getters and Setters` }
    }

class hasManualMemoryManagementParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Manual_memory_management` }
get pseudoExample() { return `malloc(4);` }
get title() { return `Manual Memory Management` }
    }

class hasMapFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Map_(higher-order_function)` }
get pseudoExample() { return `pldbFiles.map(downloadFilesFn)` }
get title() { return `Map Functions` }
    }

class hasMapsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Associative_array` }
get pseudoExample() { return `{name: "PLDB"}` }
get aka() { return `dict` }
get title() { return `Maps` }
    }

class hasMemberVariablesParser extends abstractFeatureParser {
      get aka() { return `properties` }
    }

class hasMessagePassingParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Message_passing` }
get pseudoExample() { return `"get pldb"` }
get title() { return `Message Passing` }
    }

class hasMethodChainingParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Method_chaining` }
get pseudoExample() { return `pldbFile.toString().length` }
get title() { return `Method Chaining` }
    }

class hasMethodOverloadingParser extends abstractFeatureParser {
      
    }

class hasMethodsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Method_(computer_programming)` }
get pseudoExample() { return `pldbFile.downloadWebsite()` }
get title() { return `Methods` }
    }

class hasMixinsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Mixin` }
get pseudoExample() { return `extends pldbFile, diskFile` }
get title() { return `Mixins` }
    }

class hasModulesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Module_pattern` }
get pseudoExample() { return `module PLDB {}` }
get title() { return `Module Pattern` }
    }

class hasMonadsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Monad_(functional_programming)` }
get pseudoExample() { return `g >>= f` }
get title() { return `Monad` }
    }

class hasMultiLineCommentsParser extends abstractFeatureParser {
      get tokenKeyword() { return `multiLineCommentTokens` }
get pseudoExample() { return `/* Hello PLDB */` }
get reference() { return `https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments` }
get title() { return `MultiLine Comments` }
    }

class hasMultilineStringsParser extends abstractFeatureParser {
      get pseudoExample() { return `hello = """Hello\nPLDB"""` }
get title() { return `Multiline Strings` }
    }

class hasMultipleDispatchParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Multiple_dispatch` }
get pseudoExample() { return `collide_with(x::Spaceship, y::Spaceship)` }
get title() { return `Multiple Dispatch` }
    }

class hasMultipleInheritanceParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Multiple_inheritance` }
get pseudoExample() { return `extends parentWhichExtendsSomethingElse` }
get title() { return `Multiple Inheritance` }
    }

class hasNamespacesParser extends abstractFeatureParser {
      get pseudoExample() { return `namespace PLDB {}` }
get title() { return `Namespaces` }
    }

class hasNullParser extends abstractFeatureParser {
      get pseudoExample() { return `uhOh = null` }
get reference() { return `https://en.wikipedia.org/wiki/Null_pointer` }
get title() { return `Null` }
    }

class hasOctalsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Octal` }
get pseudoExample() { return `0o464063622` }
get aka() { return `Base8` }
get title() { return `Octals` }
    }

class hasOperatorOverloadingParser extends abstractFeatureParser {
      get pseudoExample() { return `def __add__(): doSomethingDifferent()` }
get reference() { return `https://en.wikibooks.org/wiki/Introduction_to_Programming_Languages/Overloading https://en.wikipedia.org/wiki/Operator_overloading` }
get title() { return `Operator Overloading` }
    }

class hasOperatorsParser extends abstractFeatureParser {
      get pseudoExample() { return `1 + 1` }
get reference() { return `https://en.wikipedia.org/wiki/Operator_(computer_programming)` }
get title() { return `Operators` }
    }

class hasPairsParser extends abstractFeatureParser {
      get pseudoExample() { return `(pl . db)` }
get title() { return `Pairs` }
    }

class hasPartialApplicationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Partial_application` }
get pseudoExample() { return `add5 = num => addNumbers(10, num)` }
get title() { return `Partial Application` }
    }

class hasPatternMatchingParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Pattern_matching` }
get pseudoExample() { return `fib 0 = 1; fib 1 = 1` }
get title() { return `Pattern Matching` }
    }

class hasPipesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Pipeline_(software)` }
get pseudoExample() { return `ls pldb | wc` }
get title() { return `Pipes` }
    }

class hasPointersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Pointer_(computer_programming)` }
get pseudoExample() { return `int *pldb` }
get title() { return `Pointers` }
    }

class hasPolymorphismParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Polymorphism_(computer_science)` }
get pseudoExample() { return `a + "b"; 1 + 2` }
get title() { return `Polymorphism` }
    }

class hasPostfixNotationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Reverse_Polish_notation` }
get pseudoExample() { return `2 3 4 + 2 -` }
get title() { return `Postfix Notation` }
    }

class hasPrefixNotationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Polish_notation` }
get pseudoExample() { return `+ 1 2` }
get title() { return `Prefix Notation` }
    }

class hasPrintDebuggingParser extends abstractFeatureParser {
      get tokenKeyword() { return `printToken` }
get pseudoExample() { return `print "Hello PLDB"` }
get reference() { return `https://en.wikipedia.org/wiki/Debug_code#Print_debugging` }
get title() { return `Print() Debugging` }
    }

class hasProcessorRegistersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Processor_register` }
get pseudoExample() { return `eax 2` }
get title() { return `Processor Registers` }
    }

class hasRangeOperatorsParser extends abstractFeatureParser {
      get pseudoExample() { return `1 ... 10` }
get reference() { return `https://docstore.mik.ua/orelly/perl4/prog/ch03_15.htm` }
get title() { return `Range Operator` }
    }

class hasReferencesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Reference_(computer_science)` }
get pseudoExample() { return `fn(objPointer)` }
get title() { return `References` }
    }

class hasRefinementTypesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Refinement_type` }
get pseudoExample() { return `evenInt where int % 2 = 0` }
get title() { return `Refinement Types` }
    }

class hasRegularExpressionsSyntaxSugarParser extends abstractFeatureParser {
      get pseudoExample() { return `/pldb/` }
get reference() { return `https://pldb.com/concepts/regex.html` }
get title() { return `Regular Expression Syntax Sugar` }
    }

class hasRequiredMainFunctionParser extends abstractFeatureParser {
      
    }

class hasReservedWordsParser extends abstractFeatureParser {
      
    }

class hasRunTimeGuardsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Guard_(computer_science)` }
get pseudoExample() { return `f x | x > 0 = 1 | otherwise = 0` }
get title() { return `Runtime Guards` }
    }

class hasSExpressionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/S-expression` }
get pseudoExample() { return `(+ 1 1)` }
get title() { return `S-Expressions` }
    }

class hasScientificNotationParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Scientific_notation` }
get pseudoExample() { return `8076686.6e1` }
get aka() { return `E Notation` }
get title() { return `Scientific Notation` }
    }

class hasSelfOrThisWordParser extends abstractFeatureParser {
      
    }

class hasSemanticIndentationParser extends abstractFeatureParser {
      get pseudoExample() { return `line0 if true line1  print "Hello PLDB"` }
get reference() { return `https://pldb.com/posts/which-programming-languages-use-indentation.html` }
get title() { return `Semantic Indentation` }
get aka() { return `off-side rule` }
    }

class hasSetsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Set_(abstract_data_type)` }
get pseudoExample() { return `{"pldb", "PLDB"}` }
get title() { return `Sets` }
    }

class hasSingleDispatchParser extends abstractFeatureParser {
      get pseudoExample() { return `person.run()` }
get reference() { return `https://en.wikipedia.org/wiki/Dynamic_dispatch#Single_and_multiple_dispatch` }
get title() { return `Single Dispatch` }
    }

class hasSingleTypeArraysParser extends abstractFeatureParser {
      get pseudoExample() { return `const pldbRanks: int[]` }
get reference() { return `https://en.wikipedia.org/wiki/Array_data_structure` }
get title() { return `Single-Type Arrays` }
    }

class hasSourceMapsParser extends abstractFeatureParser {
      get pseudoExample() { return `{file: 'pldb.min.js',sources: ['pldb.js'], mappings: 'CAAC,IAAI,IAAM'}` }
get title() { return `Source Maps` }
    }

class hasStatementTerminatorCharacterParser extends abstractFeatureParser {
      
    }

class hasStatementsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Statement_(computer_science)` }
get pseudoExample() { return `print "Hello PLDB"` }
get title() { return `Statements` }
    }

class hasStaticMethodsParser extends abstractFeatureParser {
      get pseudoExample() { return `static downloadPldb() {}` }
get reference() { return `https://www.geeksforgeeks.org/static-methods-vs-instance-methods-java/` }
get title() { return `Static Methods` }
    }

class hasStaticTypingParser extends abstractFeatureParser {
      get pseudoExample() { return `int pldbRank = 100` }
get reference() { return `https://en.wikipedia.org/wiki/Type_system#Static_type_checking` }
get title() { return `Static Typing` }
    }

class hasStreamsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Stream_(computing)` }
get pseudoExample() { return `echo 123 | 123.txt` }
get title() { return `Streams` }
    }

class hasStringConcatOperatorParser extends abstractFeatureParser {
      
    }

class hasStringsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/String_(computer_science)` }
get tokenKeyword() { return `stringToken` }
get pseudoExample() { return `"Hello PLDB"` }
get title() { return `Strings` }
    }

class hasStructsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Struct_(C_programming_language)` }
get pseudoExample() { return `struct pldbFile { int rank; char *title; };` }
get title() { return `Structs` }
    }

class hasSwitchParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Switch_statement` }
get pseudoExample() { return `switch animal: case dog-buy; case cat-sell;` }
get title() { return `Switch Statements` }
    }

class hasSymbolTablesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Symbol_table` }
get pseudoExample() { return `SymbolName|Type|Scope;bar|function,double|extern` }
get title() { return `Symbol Tables` }
    }

class hasSymbolsParser extends abstractFeatureParser {
      
    }

class hasTemplatesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Template_metaprogramming` }
get pseudoExample() { return `template TCopy(T) {}` }
get title() { return `Templates` }
    }

class hasTernaryOperatorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Ternary_operation` }
get pseudoExample() { return `true ? 1 : 0` }
get title() { return `Ternary operators` }
    }

class hasThreadsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Thread_(computing)` }
get pseudoExample() { return `thread1(); thread2();` }
get title() { return `Threads` }
    }

class hasTimestampsParser extends abstractFeatureParser {
      
    }

class hasTraitsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Trait_(computer_programming)` }
get pseudoExample() { return `use redBorder` }
get title() { return `Traits` }
    }

class hasTriplesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Semantic_triple` }
get pseudoExample() { return `Javascript isListedIn PLDB` }
get title() { return `Triples` }
    }

class hasTryCatchParser extends abstractFeatureParser {
      
    }

class hasTypeAnnotationsParser extends abstractFeatureParser {
      get pseudoExample() { return `score: number` }
get title() { return `Type Annotations` }
    }

class hasTypeInferenceParser extends abstractFeatureParser {
      get pseudoExample() { return `imAString = "pldb"` }
get reference() { return `https://en.wikipedia.org/wiki/Type_inference` }
get title() { return `Type Inference` }
    }

class hasTypeParametersParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/TypeParameter` }
get pseudoExample() { return `function identity<T>(arg: T): T {return arg}` }
get title() { return `Type Parameters` }
    }

class hasTypedHolesParser extends abstractFeatureParser {
      get pseudoExample() { return `2 + _ => 2 + [int|float]` }
get reference() { return `https://wiki.haskell.org/GHC/Typed_holes` }
get title() { return `Typed Holes` }
    }

class hasUnaryOperatorsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Unary_operation` }
get pseudoExample() { return `count++` }
get title() { return `Unary Operators` }
    }

class hasUnicodeIdentifiersParser extends abstractFeatureParser {
      get pseudoExample() { return `δ = 0.00001` }
get title() { return `Unicode Identifers` }
    }

class hasUnionTypesParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Union_type` }
get pseudoExample() { return `any = string | number` }
get title() { return `Union Types` }
    }

class hasUnitsOfMeasureParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Unit_of_measurement` }
get pseudoExample() { return `42cm` }
get title() { return `Units of Measure` }
    }

class hasUserDefinedOperatorsParser extends abstractFeatureParser {
      
    }

class hasValueReturnedFunctionsParser extends abstractFeatureParser {
      
    }

class hasVariableSubstitutionSyntaxParser extends abstractFeatureParser {
      get pseudoExample() { return `name = "PLDB"; print $name` }
get title() { return `Variable Substitution Syntax` }
    }

class hasVariadicFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Variadic_function` }
get pseudoExample() { return `args.map(doSomething)` }
get title() { return `Variadic Functions` }
    }

class hasVirtualFunctionsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Virtual_function` }
get pseudoExample() { return `virtual FetchPLDBFile();` }
get title() { return `Virtual function` }
    }

class hasVoidFunctionsParser extends abstractFeatureParser {
      
    }

class hasWhileLoopsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/While_loop` }
get pseudoExample() { return `while (pldb.pop()) loop()` }
get title() { return `While Loops` }
    }

class hasZeroBasedNumberingParser extends abstractFeatureParser {
      get pseudoExample() { return `firstItem = pldb[0]` }
get reference() { return `https://en.wikipedia.org/wiki/Zero-based_numbering` }
get title() { return `Zero-based numbering` }
    }

class hasZippersParser extends abstractFeatureParser {
      get pseudoExample() { return `pldbCursor.moveLeft()` }
get reference() { return `https://wiki.haskell.org/Zipper https://en.wikipedia.org/wiki/Zipper_(data_structure)` }
get title() { return `Zippers` }
    }

class isCaseSensitiveParser extends abstractFeatureParser {
      get pseudoExample() { return `pldb != PLDB` }
get reference() { return `https://en.wikipedia.org/wiki/Case_sensitivity` }
get title() { return `Case Sensitivity` }
    }

class isLispParser extends abstractFeatureParser {
      get pseudoExample() { return `(+ 1 2)` }
get reference() { return `https://en.wikipedia.org/wiki/Lisp_(programming_language)` }
get title() { return `Lispy` }
    }

class letterFirstIdentifiersParser extends abstractFeatureParser {
      get pseudoExample() { return `pldb100 = "OK" // 100pldb = "ERROR"` }
get title() { return `Letter-first Identifiers` }
    }

class mergesWhitespaceParser extends abstractFeatureParser {
      get pseudoExample() { return `result = 1    +    2` }
get reference() { return `http://wiki.c2.com/?SyntacticallySignificantWhitespaceConsideredHarmful` }
get title() { return `Merges Whitespace` }
    }

class supportsBreakpointsParser extends abstractFeatureParser {
      get reference() { return `https://en.wikipedia.org/wiki/Breakpoint` }
get pseudoExample() { return `debugger;` }
get title() { return `Breakpoints` }
    }

class isLanguageParser extends abstractBooleanColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class isOpenSourceParser extends abstractBooleanColumnParser {
      get alwaysRecommended() { return true }
    }

class isPublicDomainParser extends abstractBooleanColumnParser {
      get alwaysRecommended() { return true }
    }

class gdbSupportParser extends abstractBooleanColumnParser {
      get sourceDomain() { return `sourceware.org` }
    }

class githubCopilotOptimizedParser extends abstractBooleanColumnParser {
      
    }

class isDeadParser extends abstractBooleanColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(urlCitationParser, undefined, undefined)
  }
    }

class abstractParadigmParser extends abstractBooleanColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get boolCell() {
      return this.getWord(1)
    }
    }

class visualParadigmParser extends abstractParadigmParser {
      
    }

class usesSemanticVersioningParser extends abstractBooleanColumnParser {
      
    }

class abstractOneWordGuidColumnParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get externalGuidCell() {
      return this.getWord(1)
    }
get typeForCsvDocs() { return `guid` }
    }

class codeMirrorParser extends abstractOneWordGuidColumnParser {
      get sourceDomain() { return `codemirror.net` }
    }

class monacoParser extends abstractOneWordGuidColumnParser {
      get sourceDomain() { return `microsoft.github.io/monaco-editor/` }
    }

class tryItOnlineParser extends abstractOneWordGuidColumnParser {
      get sourceDomain() { return `tio.run` }
    }

class ubuntuPackageParser extends abstractOneWordGuidColumnParser {
      get sourceDomain() { return `ubuntu.com` }
    }

class abstractMultiwordGuidColumnParser extends abstractTrueBaseColumnParser {
      get externalGuidCell() {
      return this.getWordsFrom(0)
    }
get typeForCsvDocs() { return `guid` }
    }

class compilerExplorerParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser}), undefined)
  }
get sourceDomain() { return `godbolt.org` }
    }

class githubBigQueryParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class usersParser extends abstractPopulationCountColumnParser {
      
    }

class reposParser extends abstractCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"users" : usersParser,
"repos" : reposParser}), undefined)
  }
get sourceDomain() { return `cloud.google.com` }
    }

class githubLanguageParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class reposParser extends abstractCountColumnParser {
      get fromCrawler() { return true }
    }

class wrapParser extends abstractBooleanColumnParser {
      
    }

class trendingProjectsCountParser extends abstractCountColumnParser {
      get fromCrawler() { return true }
    }

class trendingProjectsParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get fromCrawler() { return true }
    }

class groupParser extends abstractMultiwordGuidColumnParser {
      
    }

class aliasesParser extends abstractStringListColumnParser {
      
    }

class interpretersParser extends abstractStringListColumnParser {
      
    }

class aceModeParser extends abstractWordColumnParser {
      
    }

class codemirrorModeParser extends abstractWordColumnParser {
      
    }

class codemirrorMimeTypeParser extends abstractWordColumnParser {
      
    }

class tmScopeParser extends abstractMultiwordGuidColumnParser {
      
    }

class typeParser extends abstractEnumColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"fileExtensions" : fileExtensionsParser,
"filenames" : filenamesParser,
"type" : typeParser,
"repos" : reposParser,
"wrap" : wrapParser,
"trendingProjectsCount" : trendingProjectsCountParser,
"trendingProjects" : trendingProjectsParser,
"group" : groupParser,
"aliases" : aliasesParser,
"interpreters" : interpretersParser,
"aceMode" : aceModeParser,
"codemirrorMode" : codemirrorModeParser,
"codemirrorMimeType" : codemirrorMimeTypeParser,
"tmScope" : tmScopeParser}), undefined)
  }
get sourceDomain() { return `github.com` }
    }

class leachim6Parser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class filepathParser extends abstractStringColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"fileExtensions" : fileExtensionsParser,
"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser,
"filepath" : filepathParser}), undefined)
  }
get sourceDomain() { return `github.com/leachim6/hello-world` }
    }

class projectEulerParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class memberCountParser extends abstractAnnualPopulationCountMapParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"memberCount" : memberCountParser}), undefined)
  }
get sourceDomain() { return `projecteuler.net` }
    }

class pygmentsHighlighterParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class filenameParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get fileNameCell() {
      return this.getWord(1)
    }
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"fileExtensions" : fileExtensionsParser,
"filename" : filenameParser}), undefined)
  }
get sourceDomain() { return `pygments.org` }
    }

class pyplParser extends abstractMultiwordGuidColumnParser {
      get sourceDomain() { return `pypl.github.io` }
    }

class quineRelayParser extends abstractMultiwordGuidColumnParser {
      get sourceDomain() { return `github.com/mame/quine-relay` }
    }

class tiobeParser extends abstractMultiwordGuidColumnParser {
      createParserCombinator() {class currentRankParser extends abstractIntColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"currentRank" : currentRankParser}), undefined)
  }
get sourceDomain() { return `tiobe.com` }
    }

class abstractStringColumnParser extends abstractTrueBaseColumnParser {
      get stringCell() {
      return this.getWordsFrom(0)
    }
get typeForCsvDocs() { return `string` }
    }

class idParser extends abstractStringColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class getSourceParser extends abstractStringColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class descriptionParser extends abstractStringColumnParser {
      get alwaysRecommended() { return true }
    }

class abstractStringListColumnParser extends abstractStringColumnParser {
      get typeForCsvDocs() { return `string[]` }
    }

class keywordsParser extends abstractStringListColumnParser {
      get tokenCell() {
      return this.getWordsFrom(0)
    }
    }

class abstractCommonTokenParser extends abstractStringListColumnParser {
      get tokenCell() {
      return this.getWordsFrom(0)
    }
    }

class lineCommentTokenParser extends abstractCommonTokenParser {
      
    }

class multiLineCommentTokensParser extends abstractCommonTokenParser {
      
    }

class printTokenParser extends abstractCommonTokenParser {
      
    }

class stringTokenParser extends abstractCommonTokenParser {
      
    }

class assignmentTokenParser extends abstractCommonTokenParser {
      
    }

class booleanTokensParser extends abstractCommonTokenParser {
      
    }

class includeTokenParser extends abstractCommonTokenParser {
      
    }

class fileExtensionsParser extends abstractStringListColumnParser {
      get fileExtensionCell() {
      return this.getWordsFrom(0)
    }
    }

class filenamesParser extends abstractStringListColumnParser {
      get fileNameCell() {
      return this.getWordsFrom(0)
    }
    }

class creatorsParser extends abstractStringListColumnParser {
      get creatorNameCell() {
      return this.getWordsFrom(0)
    }
get alwaysRecommended() { return true }
    }

class originCommunityParser extends abstractStringListColumnParser {
      get alwaysRecommended() { return true }
    }

class abstractTrueBaseLinksColumnParser extends abstractStringListColumnParser {
      get trueBaseIdCell() {
      return this.getWordsFrom(0)
    }
get typeForCsvDocs() { return `trueBaseId[]` }
get trueBaseIds() {
 return this.getWordsFrom(1)
}
updateTruebaseIds(oldTrueBaseId, newTrueBaseId) {
 this.setContent(
  this.getWordsFrom(1)
   .map((word) => (word === oldTrueBaseId ? newTrueBaseId : word))
   .join(" ")
 )
}
    }

class forLanguagesParser extends abstractTrueBaseLinksColumnParser {
      
    }

class abstractRelationshipParser extends abstractTrueBaseLinksColumnParser {
      get sortKey() { return `abstractRelationshipParser` }
    }

class relatedParser extends abstractRelationshipParser {
      
    }

class runsOnVmParser extends abstractRelationshipParser {
      
    }

class influencedByParser extends abstractRelationshipParser {
      
    }

class successorOfParser extends abstractRelationshipParser {
      
    }

class subsetOfParser extends abstractRelationshipParser {
      
    }

class implementationOfParser extends abstractRelationshipParser {
      
    }

class renamedToParser extends abstractRelationshipParser {
      
    }

class supersetOfParser extends abstractRelationshipParser {
      
    }

class writtenInParser extends abstractRelationshipParser {
      
    }

class extensionOfParser extends abstractRelationshipParser {
      
    }

class forkOfParser extends abstractRelationshipParser {
      
    }

class compilesToParser extends abstractRelationshipParser {
      
    }

class inputLanguagesParser extends abstractRelationshipParser {
      
    }

class titleParser extends abstractStringColumnParser {
      
    }

class standsForParser extends abstractStringColumnParser {
      
    }

class akaParser extends abstractStringColumnParser {
      
    }

class oldNameParser extends abstractStringColumnParser {
      
    }

class abstractNumericColumnParser extends abstractTrueBaseColumnParser {
      get typeForCsvDocs() { return `number` }
    }

class abstractIntColumnParser extends abstractNumericColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get intCell() {
      return parseInt(this.getWord(1))
    }
get typeForCsvDocs() { return `integer` }
    }

class hoplIdParser extends abstractIntColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class abstractComputedSumColumnParser extends abstractIntColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class bookCountParser extends abstractComputedSumColumnParser {
      get suggestInAutocomplete() { return false }
    }

class paperCountParser extends abstractComputedSumColumnParser {
      get suggestInAutocomplete() { return false }
    }

class exampleCountParser extends abstractComputedSumColumnParser {
      get suggestInAutocomplete() { return false }
    }

class factCountParser extends abstractComputedSumColumnParser {
      get suggestInAutocomplete() { return false }
    }

class abstractCountColumnParser extends abstractIntColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get countCell() {
      return parseFloat(this.getWord(1))
    }
    }

class abstractComputedEstimateColumnParser extends abstractCountColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class numberOfUsersEstimateParser extends abstractComputedEstimateColumnParser {
      get suggestInAutocomplete() { return false }
    }

class numberOfJobsEstimateParser extends abstractComputedEstimateColumnParser {
      get suggestInAutocomplete() { return false }
    }

class centralPackageRepositoryCountParser extends abstractCountColumnParser {
      
    }

class packageInstallCountParser extends abstractCountColumnParser {
      
    }

class packageCountParser extends abstractCountColumnParser {
      
    }

class abstractPopulationCountColumnParser extends abstractCountColumnParser {
      
    }

class packageAuthorsParser extends abstractPopulationCountColumnParser {
      
    }

class abstractComputedRankColumnParser extends abstractIntColumnParser {
      get suggestInAutocomplete() { return false }
get isComputed() { return true }
    }

class rankParser extends abstractComputedRankColumnParser {
      get suggestInAutocomplete() { return false }
    }

class languageRankParser extends abstractComputedRankColumnParser {
      get suggestInAutocomplete() { return false }
    }

class abstractYearColumnParser extends abstractIntColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get yearCell() {
      return parseFloat(this.getWord(1))
    }
    }

class lastActivityParser extends abstractYearColumnParser {
      get isComputed() { return true }
get suggestInAutocomplete() { return false }
    }

class appearedParser extends abstractYearColumnParser {
      
    }

class wordRankParser extends abstractIntColumnParser {
      
    }

class abstractFloatColumnParser extends abstractNumericColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get floatCell() {
      return parseFloat(this.getWord(1))
    }
    }

class abstractPercentageColumnParser extends abstractNumericColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get percentCell() {
      return this.getWord(1)
    }
    }

class countryParser extends abstractTrueBaseColumnParser {
      get countryNameCell() {
      return this.getWordsFrom(0)
    }
get alwaysRecommended() { return true }
    }

class dblpParser extends abstractTrueBaseColumnParser {
      createParserCombinator() {class hitsParser extends abstractCountColumnParser {
      
    }

class publicationsParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"hits" : hitsParser,
"publications" : publicationsParser}), undefined)
  }
get sourceDomain() { return `dblp.org` }
get fromCrawler() { return true }
    }

class abstractStringBlobColumnParser extends abstractTrueBaseColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get typeForCsvDocs() { return `multilineString` }
get columnValue() {
 return this.childrenToString()
}
    }

class abstractCodeColumnParser extends abstractStringBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }

class equationParser extends abstractCodeColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }

class exampleParser extends abstractCodeColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }

class helloWorldCollectionParser extends exampleParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get columnNameCell() {
      return this.getWord(0)
    }
get helloWorldCollectionIdCell() {
      return this.getWordsFrom(1)
    }
get sourceDomain() { return `helloworldcollection.de` }
    }

class funFactParser extends abstractCodeColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get columnNameCell() {
      return this.getWord(0)
    }
get urlCell() {
      return this.getWord(1)
    }
    }

class abstractDelimitedValuesBlobColumnParser extends abstractStringBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }

class goodreadsParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get sourceDomain() { return `goodreads.com` }
get fromCrawler() { return true }
    }

class hackerNewsDiscussionsParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get sourceDomain() { return `news.ycombinator.com` }
get fromCrawler() { return true }
    }

class isbndbParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get sourceDomain() { return `isbndb.com` }
get fromCrawler() { return true }
    }

class semanticScholarParser extends abstractDelimitedValuesBlobColumnParser {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
get sourceDomain() { return `semanticscholar.org` }
get fromCrawler() { return true }
    }

class abstractEnumColumnParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get enumCell() {
      return this.getWord(1)
    }
get typeForCsvDocs() { return `enum` }
    }

class fileTypeParser extends abstractEnumColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get fileTypeWordCell() {
      return this.getWord(1)
    }
    }

class nativeLanguageParser extends abstractEnumColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get nativeLanguageWordCell() {
      return this.getWord(1)
    }
    }

class announcementMethodParser extends abstractEnumColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get announcementMethodCell() {
      return this.getWord(1)
    }
    }

class typeParser extends abstractEnumColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get typeCell() {
      return this.getWord(1)
    }
    }

class abstractHashMapColumnParser extends abstractTrueBaseColumnParser {
      get typeForCsvDocs() { return `multilineStringMap` }
get columnValue() {
 return this.childrenToString()
}
    }

class abstractAnnualPopulationCountMapParser extends abstractHashMapColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(annualPopulationCountParser, undefined, undefined)
  }
    }

class indeedJobsParser extends abstractAnnualPopulationCountMapParser {
      get stringCell() {
      return this.getWordsFrom(0)
    }
get sourceDomain() { return `indeed.com` }
    }

class linkedInSkillParser extends abstractAnnualPopulationCountMapParser {
      get stringCell() {
      return this.getWordsFrom(0)
    }
get sourceDomain() { return `linkedin.com` }
    }

class abstractAnnualRankMapParser extends abstractHashMapColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(annualRankParser, undefined, undefined)
  }
    }

class repoStatsParser extends abstractHashMapColumnParser {
      createParserCombinator() {class firstCommitParser extends abstractYearColumnParser {
      
    }

class commitsParser extends abstractCountColumnParser {
      
    }

class committersParser extends abstractCountColumnParser {
      
    }

class filesParser extends abstractCountColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"description" : descriptionParser,
"firstCommit" : firstCommitParser,
"commits" : commitsParser,
"committers" : committersParser,
"files" : filesParser}), undefined)
  }
    }

class stackOverflowSurveyParser extends abstractHashMapColumnParser {
      createParserCombinator() {class stackOverflowSurveyYearParser extends GrammarBackedNode {
      createParserCombinator() {class usersParser extends abstractPopulationCountColumnParser {
      
    }

class medianSalaryParser extends abstractIntColumnParser {
      
    }

class fansParser extends abstractPopulationCountColumnParser {
      
    }

class percentageUsingParser extends abstractFloatColumnParser {
      
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"users" : usersParser,
"medianSalary" : medianSalaryParser,
"fans" : fansParser,
"percentageUsing" : percentageUsingParser}), undefined)
  }
get yearCell() {
      return parseFloat(this.getWord(0))
    }
    }
  return new TreeNode.ParserCombinator(undefined, undefined, [{regex: /\d+/, parser: stackOverflowSurveyYearParser}])
  }
get sourceDomain() { return `insights.stackoverflow.com` }
    }

class versionsParser extends abstractHashMapColumnParser {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(versionParser, undefined, undefined)
  }
    }

class abstractWordColumnParser extends abstractTrueBaseColumnParser {
      get columnNameCell() {
      return this.getWord(0)
    }
get wordCell() {
      return this.getWord(1)
    }
get typeForCsvDocs() { return `word` }
    }

class domainNameParser extends abstractWordColumnParser {
      createParserCombinator() {class registeredParser extends abstractYearColumnParser {
      
    }

class awisRankParser extends abstractAnnualRankMapParser {
      get sourceDomain() { return `aws.amazon.com` }
    }
  return new TreeNode.ParserCombinator(undefined, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"registered" : registeredParser,
"awisRank" : awisRankParser}), undefined)
  }
get columnNameCell() {
      return this.getWord(0)
    }
get domainNameCell() {
      return this.getWord(1)
    }
    }

class featureExampleCodeParser extends GrammarBackedNode {
      createParserCombinator() { return new TreeNode.ParserCombinator(this._getBlobParserCatchAllParser())}
getErrors() { return [] }
    }

class annualRankParser extends GrammarBackedNode {
      get yearCell() {
      return parseFloat(this.getWord(0))
    }
get rankCell() {
      return parseFloat(this.getWord(1))
    }
    }

class pldbParser extends GrammarBackedNode {
      createParserCombinator() {
  return new TreeNode.ParserCombinator(trueBaseErrorParser, Object.assign(Object.assign({}, super.createParserCombinator()._getFirstWordMapAsObject()), {"annualReportsUrl" : annualReportsUrlParser,
"antlr" : antlrParser,
"hopl" : hoplParser,
"jupyterKernel" : jupyterKernelParser,
"meetup" : meetupParser,
"subreddit" : subredditParser,
"replit" : replitParser,
"rosettaCode" : rosettaCodeParser,
"twitter" : twitterParser,
"discord" : discordParser,
"discourse" : discourseParser,
"irc" : ircParser,
"zulip" : zulipParser,
"cheatSheetUrl" : cheatSheetUrlParser,
"conference" : conferenceParser,
"demoVideo" : demoVideoParser,
"documentation" : documentationParser,
"devDocumentation" : devDocumentationParser,
"downloadPageUrl" : downloadPageUrlParser,
"ebook" : ebookParser,
"emailList" : emailListParser,
"esolang" : esolangParser,
"eventsPageUrl" : eventsPageUrlParser,
"faqPageUrl" : faqPageUrlParser,
"gitRepo" : gitRepoParser,
"githubRepo" : githubRepoParser,
"gitlabRepo" : gitlabRepoParser,
"sourcehutRepo" : sourcehutRepoParser,
"gource" : gourceParser,
"firstAnnouncement" : firstAnnouncementParser,
"screenshot" : screenshotParser,
"photo" : photoParser,
"languageServerProtocolProject" : languageServerProtocolProjectParser,
"linguistGrammarRepo" : linguistGrammarRepoParser,
"officialBlogUrl" : officialBlogUrlParser,
"packageRepository" : packageRepositoryParser,
"proposals" : proposalsParser,
"redditDiscussion" : redditDiscussionParser,
"reference" : referenceParser,
"releaseNotesUrl" : releaseNotesUrlParser,
"rijuRepl" : rijuReplParser,
"roadmap" : roadmapParser,
"spec" : specParser,
"website" : websiteParser,
"webRepl" : webReplParser,
"wikipedia" : wikipediaParser,
"canDoShebang" : canDoShebangParser,
"canReadCommandLineArgs" : canReadCommandLineArgsParser,
"canUseQuestionMarksAsPartOfIdentifier" : canUseQuestionMarksAsPartOfIdentifierParser,
"canWriteToDisk" : canWriteToDiskParser,
"hasAbstractTypes" : hasAbstractTypesParser,
"hasAccessModifiers" : hasAccessModifiersParser,
"hasAlgebraicTypes" : hasAlgebraicTypesParser,
"hasAnonymousFunctions" : hasAnonymousFunctionsParser,
"hasArraySlicingSyntax" : hasArraySlicingSyntaxParser,
"hasAssertStatements" : hasAssertStatementsParser,
"hasAssignment" : hasAssignmentParser,
"hasAsyncAwait" : hasAsyncAwaitParser,
"hasBinaryNumbers" : hasBinaryNumbersParser,
"hasBinaryOperators" : hasBinaryOperatorsParser,
"hasBitWiseOperators" : hasBitWiseOperatorsParser,
"hasBlobs" : hasBlobsParser,
"hasBooleans" : hasBooleansParser,
"hasBoundedCheckedArrays" : hasBoundedCheckedArraysParser,
"hasBreak" : hasBreakParser,
"hasBuiltInRegex" : hasBuiltInRegexParser,
"hasCaseInsensitiveIdentifiers" : hasCaseInsensitiveIdentifiersParser,
"hasCharacters" : hasCharactersParser,
"hasClasses" : hasClassesParser,
"hasClobs" : hasClobsParser,
"hasComments" : hasCommentsParser,
"hasConditionals" : hasConditionalsParser,
"hasConstants" : hasConstantsParser,
"hasConstructors" : hasConstructorsParser,
"hasContinue" : hasContinueParser,
"hasDecimals" : hasDecimalsParser,
"hasDefaultParameters" : hasDefaultParametersParser,
"hasDependentTypes" : hasDependentTypesParser,
"hasDestructuring" : hasDestructuringParser,
"hasDirectives" : hasDirectivesParser,
"hasDisposeBlocks" : hasDisposeBlocksParser,
"hasDocComments" : hasDocCommentsParser,
"hasDuckTyping" : hasDuckTypingParser,
"hasDynamicProperties" : hasDynamicPropertiesParser,
"hasDynamicSizedArrays" : hasDynamicSizedArraysParser,
"hasDynamicTyping" : hasDynamicTypingParser,
"hasEnums" : hasEnumsParser,
"hasEscapeCharacters" : hasEscapeCharactersParser,
"hasExceptions" : hasExceptionsParser,
"hasExplicitTypeCasting" : hasExplicitTypeCastingParser,
"hasExports" : hasExportsParser,
"hasExpressions" : hasExpressionsParser,
"hasFirstClassFunctions" : hasFirstClassFunctionsParser,
"hasFixedPoint" : hasFixedPointParser,
"hasFloats" : hasFloatsParser,
"hasFnArguments" : hasFnArgumentsParser,
"hasForEachLoops" : hasForEachLoopsParser,
"hasForLoops" : hasForLoopsParser,
"hasFunctionComposition" : hasFunctionCompositionParser,
"hasFunctionOverloading" : hasFunctionOverloadingParser,
"hasFunctions" : hasFunctionsParser,
"hasGarbageCollection" : hasGarbageCollectionParser,
"hasGenerators" : hasGeneratorsParser,
"hasGenerics" : hasGenericsParser,
"hasGlobalScope" : hasGlobalScopeParser,
"hasGotos" : hasGotosParser,
"hasHereDocs" : hasHereDocsParser,
"hasHexadecimals" : hasHexadecimalsParser,
"hasHomoiconicity" : hasHomoiconicityParser,
"hasIds" : hasIdsParser,
"hasIfElses" : hasIfElsesParser,
"hasIfs" : hasIfsParser,
"hasImplicitArguments" : hasImplicitArgumentsParser,
"hasImplicitTypeConversions" : hasImplicitTypeConversionsParser,
"hasImports" : hasImportsParser,
"hasIncrementAndDecrementOperators" : hasIncrementAndDecrementOperatorsParser,
"hasInfixNotation" : hasInfixNotationParser,
"hasInheritance" : hasInheritanceParser,
"hasIntegers" : hasIntegersParser,
"hasInterfaces" : hasInterfacesParser,
"hasIterators" : hasIteratorsParser,
"hasLabels" : hasLabelsParser,
"hasLazyEvaluation" : hasLazyEvaluationParser,
"hasLineComments" : hasLineCommentsParser,
"hasLists" : hasListsParser,
"hasMacros" : hasMacrosParser,
"hasMagicGettersAndSetters" : hasMagicGettersAndSettersParser,
"hasManualMemoryManagement" : hasManualMemoryManagementParser,
"hasMapFunctions" : hasMapFunctionsParser,
"hasMaps" : hasMapsParser,
"hasMemberVariables" : hasMemberVariablesParser,
"hasMessagePassing" : hasMessagePassingParser,
"hasMethodChaining" : hasMethodChainingParser,
"hasMethodOverloading" : hasMethodOverloadingParser,
"hasMethods" : hasMethodsParser,
"hasMixins" : hasMixinsParser,
"hasModules" : hasModulesParser,
"hasMonads" : hasMonadsParser,
"hasMultiLineComments" : hasMultiLineCommentsParser,
"hasMultilineStrings" : hasMultilineStringsParser,
"hasMultipleDispatch" : hasMultipleDispatchParser,
"hasMultipleInheritance" : hasMultipleInheritanceParser,
"hasNamespaces" : hasNamespacesParser,
"hasNull" : hasNullParser,
"hasOctals" : hasOctalsParser,
"hasOperatorOverloading" : hasOperatorOverloadingParser,
"hasOperators" : hasOperatorsParser,
"hasPairs" : hasPairsParser,
"hasPartialApplication" : hasPartialApplicationParser,
"hasPatternMatching" : hasPatternMatchingParser,
"hasPipes" : hasPipesParser,
"hasPointers" : hasPointersParser,
"hasPolymorphism" : hasPolymorphismParser,
"hasPostfixNotation" : hasPostfixNotationParser,
"hasPrefixNotation" : hasPrefixNotationParser,
"hasPrintDebugging" : hasPrintDebuggingParser,
"hasProcessorRegisters" : hasProcessorRegistersParser,
"hasRangeOperators" : hasRangeOperatorsParser,
"hasReferences" : hasReferencesParser,
"hasRefinementTypes" : hasRefinementTypesParser,
"hasRegularExpressionsSyntaxSugar" : hasRegularExpressionsSyntaxSugarParser,
"hasRequiredMainFunction" : hasRequiredMainFunctionParser,
"hasReservedWords" : hasReservedWordsParser,
"hasRunTimeGuards" : hasRunTimeGuardsParser,
"hasSExpressions" : hasSExpressionsParser,
"hasScientificNotation" : hasScientificNotationParser,
"hasSelfOrThisWord" : hasSelfOrThisWordParser,
"hasSemanticIndentation" : hasSemanticIndentationParser,
"hasSets" : hasSetsParser,
"hasSingleDispatch" : hasSingleDispatchParser,
"hasSingleTypeArrays" : hasSingleTypeArraysParser,
"hasSourceMaps" : hasSourceMapsParser,
"hasStatementTerminatorCharacter" : hasStatementTerminatorCharacterParser,
"hasStatements" : hasStatementsParser,
"hasStaticMethods" : hasStaticMethodsParser,
"hasStaticTyping" : hasStaticTypingParser,
"hasStreams" : hasStreamsParser,
"hasStringConcatOperator" : hasStringConcatOperatorParser,
"hasStrings" : hasStringsParser,
"hasStructs" : hasStructsParser,
"hasSwitch" : hasSwitchParser,
"hasSymbolTables" : hasSymbolTablesParser,
"hasSymbols" : hasSymbolsParser,
"hasTemplates" : hasTemplatesParser,
"hasTernaryOperators" : hasTernaryOperatorsParser,
"hasThreads" : hasThreadsParser,
"hasTimestamps" : hasTimestampsParser,
"hasTraits" : hasTraitsParser,
"hasTriples" : hasTriplesParser,
"hasTryCatch" : hasTryCatchParser,
"hasTypeAnnotations" : hasTypeAnnotationsParser,
"hasTypeInference" : hasTypeInferenceParser,
"hasTypeParameters" : hasTypeParametersParser,
"hasTypedHoles" : hasTypedHolesParser,
"hasUnaryOperators" : hasUnaryOperatorsParser,
"hasUnicodeIdentifiers" : hasUnicodeIdentifiersParser,
"hasUnionTypes" : hasUnionTypesParser,
"hasUnitsOfMeasure" : hasUnitsOfMeasureParser,
"hasUserDefinedOperators" : hasUserDefinedOperatorsParser,
"hasValueReturnedFunctions" : hasValueReturnedFunctionsParser,
"hasVariableSubstitutionSyntax" : hasVariableSubstitutionSyntaxParser,
"hasVariadicFunctions" : hasVariadicFunctionsParser,
"hasVirtualFunctions" : hasVirtualFunctionsParser,
"hasVoidFunctions" : hasVoidFunctionsParser,
"hasWhileLoops" : hasWhileLoopsParser,
"hasZeroBasedNumbering" : hasZeroBasedNumberingParser,
"hasZippers" : hasZippersParser,
"isCaseSensitive" : isCaseSensitiveParser,
"isLisp" : isLispParser,
"letterFirstIdentifiers" : letterFirstIdentifiersParser,
"mergesWhitespace" : mergesWhitespaceParser,
"supportsBreakpoints" : supportsBreakpointsParser,
"isLanguage" : isLanguageParser,
"isOpenSource" : isOpenSourceParser,
"isPublicDomain" : isPublicDomainParser,
"gdbSupport" : gdbSupportParser,
"githubCopilotOptimized" : githubCopilotOptimizedParser,
"isDead" : isDeadParser,
"visualParadigm" : visualParadigmParser,
"usesSemanticVersioning" : usesSemanticVersioningParser,
"codeMirror" : codeMirrorParser,
"monaco" : monacoParser,
"tryItOnline" : tryItOnlineParser,
"ubuntuPackage" : ubuntuPackageParser,
"compilerExplorer" : compilerExplorerParser,
"githubBigQuery" : githubBigQueryParser,
"githubLanguage" : githubLanguageParser,
"leachim6" : leachim6Parser,
"projectEuler" : projectEulerParser,
"pygmentsHighlighter" : pygmentsHighlighterParser,
"pypl" : pyplParser,
"quineRelay" : quineRelayParser,
"tiobe" : tiobeParser,
"id" : idParser,
"getSource" : getSourceParser,
"description" : descriptionParser,
"keywords" : keywordsParser,
"lineCommentToken" : lineCommentTokenParser,
"multiLineCommentTokens" : multiLineCommentTokensParser,
"printToken" : printTokenParser,
"stringToken" : stringTokenParser,
"assignmentToken" : assignmentTokenParser,
"booleanTokens" : booleanTokensParser,
"includeToken" : includeTokenParser,
"fileExtensions" : fileExtensionsParser,
"filenames" : filenamesParser,
"creators" : creatorsParser,
"originCommunity" : originCommunityParser,
"forLanguages" : forLanguagesParser,
"related" : relatedParser,
"runsOnVm" : runsOnVmParser,
"influencedBy" : influencedByParser,
"successorOf" : successorOfParser,
"subsetOf" : subsetOfParser,
"implementationOf" : implementationOfParser,
"renamedTo" : renamedToParser,
"supersetOf" : supersetOfParser,
"writtenIn" : writtenInParser,
"extensionOf" : extensionOfParser,
"forkOf" : forkOfParser,
"compilesTo" : compilesToParser,
"inputLanguages" : inputLanguagesParser,
"title" : titleParser,
"standsFor" : standsForParser,
"aka" : akaParser,
"oldName" : oldNameParser,
"hoplId" : hoplIdParser,
"bookCount" : bookCountParser,
"paperCount" : paperCountParser,
"exampleCount" : exampleCountParser,
"factCount" : factCountParser,
"numberOfUsersEstimate" : numberOfUsersEstimateParser,
"numberOfJobsEstimate" : numberOfJobsEstimateParser,
"centralPackageRepositoryCount" : centralPackageRepositoryCountParser,
"packageInstallCount" : packageInstallCountParser,
"packageCount" : packageCountParser,
"packageAuthors" : packageAuthorsParser,
"rank" : rankParser,
"languageRank" : languageRankParser,
"lastActivity" : lastActivityParser,
"appeared" : appearedParser,
"wordRank" : wordRankParser,
"country" : countryParser,
"dblp" : dblpParser,
"equation" : equationParser,
"example" : exampleParser,
"helloWorldCollection" : helloWorldCollectionParser,
"funFact" : funFactParser,
"goodreads" : goodreadsParser,
"hackerNewsDiscussions" : hackerNewsDiscussionsParser,
"isbndb" : isbndbParser,
"semanticScholar" : semanticScholarParser,
"fileType" : fileTypeParser,
"nativeLanguage" : nativeLanguageParser,
"announcementMethod" : announcementMethodParser,
"type" : typeParser,
"indeedJobs" : indeedJobsParser,
"linkedInSkill" : linkedInSkillParser,
"repoStats" : repoStatsParser,
"stackOverflowSurvey" : stackOverflowSurveyParser,
"versions" : versionsParser,
"domainName" : domainNameParser}), [{regex: /^$/, parser: blankLineParser}])
  }
get fileNameCell() {
      return this.getWord(0)
    }
get fileExtension() { return `pldb` }
static cachedHandGrammarProgramRoot = new HandGrammarProgram(`// Basics
// todo trim the trailing slash
// Basics
// todo Grammar should probably have pattern matching. And then we can detect semantic versions in the below.
// todo Scoping by file in Grammar lang would be really useful for this file. Also, multiple inheritance or mixins.
// WorldWideColumns is an experimental attempt to define reusuable base abstract column types for TrueBases.
// Version 2.0.0
// Cell Parsers
// Enum Parsers
// Numeric cell parsers
// Common numeric cell extensions
// String Cell Parsers
// Line Parsers
// The main line parser. Anything extending this will be included in the CSV dumps.
// Common string parsers
// Common blob parsers
// Links between TrueBase files
// Boolean column node
// Commmon numeric parsers
// Common time parsers
// Common miscellaneous parsers
// URL Parsers
// GUID Parsers
// Hashmap parsers
// Common population columns
// Common computed types























































conferenceNameCell
 extends stringCell
countryNameCell
 extends stringCell
tokenCell
 highlightScope keyword
fileExtensionCell
 extends stringCell
fileTypeWordCell
 enum paper text binary na
 highlightScope constant.language
githubRepoUrlCell
 extends urlCell
 regex ^https://github.com/.+/.+$
helloWorldCollectionIdCell
 description Id for this language on hello world collection.
nativeLanguageWordCell
 description The name of a natural language like English or Japanese.
announcementMethodCell
 description Common ways languages are first announced.
 enum pressRelease paper rfc webpage blogPost interview dissertation
 highlightScope constant.language
creatorNameCell
 extends stringCell
aliasCell
rankCell
 extends intCell
typeCell
 enum assembly pl barCodeFormat hardwareDescriptionLanguage knowledgeBase binaryDataFormat contractLanguage timeFormat computingMachine xmlFormat yamlFormat jsonFormat compiler grammarLanguage dataValidationLanguage application ir isa queryLanguage protocol os esolang template textMarkup characterEncoding idl library editor cloud textDataFormat visual plzoo interpreter notation binaryExecutable dataNotation stylesheetLanguage schema bytecode vm filesystem standard linter packageManager framework webApi feature optimizingCompiler numeralSystem hashFunction database font distribution headerLang dataStructure musicalNotation textEncodingFormat equation wikiMarkup decompiler configFormat diffFormat unixApplication webBrowser browserEngine
 highlightScope constant.language
versionCell
 extends stringCell
 description Version numbers.
domainNameCell
 extends stringCell
blankCell
anyCell
enumCell
boolCell
 extends enumCell
 enum true false
numberCell
intCell
 extends numberCell
 highlightScope constant.numeric.integer
floatCell
 extends numberCell
 highlightScope constant.numeric.float
percentCell
 highlightScope constant.numeric.integer
 regex \\d+%
countCell
 extends intCell
populationCountCell
 description A count of people.
 extends countCell
yearCell
 extends intCell
stringCell
 highlightScope string
wordCell
 extends stringCell
 description Any string except for a blank cell.
 regex .+
columnNameCell
 highlightScope keyword
 regex [a-zA-Z0-9]+
trueBaseIdCell
 description A global identifier for this entity in a TrueBase. Currently a very restricted character set to ensure compatibility between a wide variety of URLs and filesystems.
 regex [a-z0-9\\-\\.]+
 highlightScope string
 enum 05ab1e 1-pak 1620sps 1c-enterprise 2-pak 20-gate 2lisp 2obj 3-lisp 3apl 3d-logo 3dcomposer 3ds 3mf 3rip 4g-standard 4th-dimension 51forth 6gunz 8th a-0-system a-sharp a51 aadl aaf aarch64 aardappel aardvark abacus-machine abal abap abbreviated-test-language-for-all-systems abc-80 abc-algol abc abcl-cp abcl-f abcl-lang abcl abcpp abel able abnf abs abset abstract-state-machine-language abstracto absys ac-toolbox accent ace acl acl2 acme acore acorn-atom acorn-lang acorn acornsoft-logo acos acsi-matic acsl act-iii act-one actalk action-code-script action actionscript active-language-i active-u-datalog activevfp activity-pub actor actors actus ad-hoc ada-95 ada-9x ada-tl ada adabtpl adagio adam-standard adam adamant adaplex address adenine-programming-language adept ades-ii ades aditi adlib adobe-font-metrics ads-b-standard advanced-continuous-simulation-language advice-taker aed aepl aesop afnix afs agda agent-k agentspeak agl agora ags-script aheui aida aids ail aime aiml aimms air airtable-app ais aith akl al aladin alambik alan alba albatross alcor aldat aldes aldor aldwych ale alec alef aleph alf alfred algae algebraic-compiler algebraic-modeling-language algem algernon algo algobox algol-58 algol-60 algol-68-r algol-68-rt algol-68 algol-e algol-n algol-w algol-x algol algy alice aljabr allegro-common-lisp allo alloy alma-0 alma-007 alma-o alma almir almquist-shell alohanet alonzo alpaca alpak alpha-programming-language alphabasic alphapop alphard-programming-language alphard alpine-abuild alps altac altair-basic altibase altran alumina amalthea amanda amazon-dynamodb amazon-rds amber ambienttalk ambit-g ambit-l ambit ambush amiga-e amiga-programming-languages amigabasic amos amperes-circuital-equation ampl amppl-i amppl-ii amqp amtran-70 amtran amulet ana analytical-engine-machine and-or andante andorra-i andorra android angelscript angr anna ans-mumps ansi-basic ant-build-system ante-esolang ante antha antlr apache-cassandra apache-derby apache-hbase apache-phoenix apache-velocity apache apacheconf apar aparel ape100 apescript apex api-blueprint apl-gpss apl-hp apl-z80 apl apl2 aplette aplgol-2 aplgol aplo aplus aplusplus aplx apollo-guidance-computer apostle appcode-editor appl-a apple-1-machine apple-basic apple-prodos applescript applesoft-basic applog april aprol apse apt-pm apt aqasm aql aquarius-prolog arabic-numerals arablan arango-db arbortext-command-language arc-assembly arc-isa arc archi archieml arctic arden-syntax arduino arend aretext arexx arezzo-notation argdown argon argos argus arith-matic arjuna ark-lang ark arkscript arm-templates arm armani arret arrow-format arrow arta artspeak arturo arvelie-format ascii-armor ascii asciidoc asciidots asciimath asdf asf-sdf ashmedai asic-programming-language asmjs asn-1 asp.net asp aspectcpp aspectj aspen aspol assembly-language assemblyscript associons asspegique astatine asterisk asterius-compiler astlog astro astroml asymptote atari-basic atari-microsoft-basic atari-st-basic atlas-autocode atlas atmel-avr atol atom-editor atom atomese atomo atomos atomspace ats attic-numerals attoparsec atx aubit-4gl augeas augment aui aur-pm aurora austral autasim autocad-app autocode autocoder-ii autocoder-iii autocoder autoconf autodraft autogrp autohotkey autoit autolisp autoloft automast automator autopromt avail avalon-common-lisp averest avi-synth avr avro awk awl aws axcess axiom-computer-algebra-system axiom axt-format aztec-c azure b-line b b3-ir b32-business-basic b4tran babel baby-modula-3 babylonian-numerals back badlanguage bag-format balanced-ternary-notation balg balgol balinda-lisp ballerina-central-pm ballerina balm balsa baltazar baltik bam-format bamboo bancstar-programming-language bare barrel bartok base64 baseball basel bash basic-11 basic-256 basic-ap basic-e basic-pdp-1-lisp basic-plus basic-programming basic-stamp basic basic09 basic4android basic4gl basic4ppc basicode basicx basil basis-universal-format batari-basic batch battlestar bawk bayer-expressions bayes-equation baysick bazel bbc-basic bbcode bbj bbn-lisp bbx bc-neliac bc bcpl bcx bdl beads-lang beagle beam-bytecode beam-vm beanshell beatnik beautiful-report-language bebasic bed-format bedsocs bee beebasic beef-lang beef beflix befunge behavior-markup-language bel-lang bel ber berkeley-db-lib berkeleydb berry besys beta-basic beta-project beta-prolog beta bgraf2 bhsl bibtex bicep biferno bigloo bigmac bigwig-format bigwig-programming-language bigwig binary-equation binary-ninja binary-notation binaryen bind-app bioconductor-pm biomod bioscript biossim biplan bird birkbeck-assembly bison bisonpp bistro-programming-language bitarray bitbake bitc bizubee bjou bla blackcoffee blacklight blade-lang blade blake-hash-function blank blaze-2 blaze blazex blc blender-app bliss blitz3d blitzbasic blitzmax blitzplus blockly blockml bloom blooms bloop blox blue-programming-language blue blueprints bluespec blur-markup-language blz bmd bml bmp-format bnf boa bob bog boil bolin bolt bon-programming-language boo boogie boomerang-decompiler boost-lib booster borneo boron bosque bossam bounce-lang bounce bourne-shell boxer boxx bpel bpkg-pm bpl bpmn bpn2 bqn brackets-editor brain-flak brainfuck breccia bridgetalk brightscript-lang brisk brl bro broccoli-1 broccoli-2 broccoli brooks-programming-language brouhaha brown-university-interactive-language bscript-interpreter bscript bsml bsp bucardo bucklescript buddyscript bugsys bullfrog bun bush business-application-language business-basic business-object-notation business-process-modeling-language business-rule-language butterfly-common-lisp buzz bx bytecode-modeling-language bytelisp bython bywater-basic c-- c-al c-cubed c-flat c-for-all c-headers c-shell c-smile c-talk c c2 c3 ca-realizer ca-telon ca65-assembly cabal cache-basic cache-objectscript cactus cadence-skill cado-systems-technical-information cafeobj caffeine cages caisys cajole cal calc-var calc calc4 cali-lang caltech-intermediate-form calypso cam camac camal camil caml candor candy-codes candy cane canon-capsl cantor capn-proto capsl capsule capybara caramel carbon carp carpet carth cartocss casio-basic cassandre cat catala catalysis categorical-query-language cayenne cayley cbasic cbor ccal ccd ccel ccr ccs cda cddl cdf cdl cdlpp cecil cedar-fortran cedar ceemac celip cell cellsim celsius-webscript ceprol cesil ceu ceylon cfengine cfml cfscript cg cgol ch chain-format chain-programming-language chained-arrow-notation chaiscript champ chaos-lang chapel chappe-code charcoal charity charly charmpp charrette-ada chartio-app charybdis chatterbot checked-c checkout cheetah chef chemtrains cheri chevrotain chibicc chicken-lang chicken chicon chika chill chimera chinese-basic chip-8 chip-programming-language chipmunk-basic chirp chisel chocolatey-pm chomski chrome-programming-language chronolog chronologmc chronologz chrysalisp chuck ciao-programming-language ciel cif cigale cil cilk cimfast cims-pl-i cir circa circal circle-lang cirru cish cito citrine cityhash-hash-function cixl cl-i claire clamp clanger clarion clarity claro clascal clash class classic-ada classic clausal-lang clay clean cleanlang clear cleo cleogo cleopatra cli-assembly click clickpath clike clion-editor clipper clips clisp clist clix cloc cloe clojars-pm clojure clojurescript clos closure-templates cloud-firestore-security-rules clover clox clp-star clpr clu clx cmake cmix cmn cms-2 cms-exec cms-pipelines cmu-common-lisp co-dfns co2 cobloc cobol-net cobol cobolscript cobra coco-r coco cocoapods-pm coconut coda-editor code-blocks-editor codecept codeflow codegear-delphi codelite-editor codemirror codeql codil coff coffee-cinema-4d coffeepp coffeescript cogmap cogo coherence coherent-parallel-c coi-protocol cokescript col colascript colasl cold-k coldfusion-components coldfusion collada color-basic colorforth comal combined-log-format comby comfy comit comm commen commodore-basic common-lisp common-log-format common-workflow-language commonloops commonmark compact-application-solution-language compiler-compiler complex-prolog component-pascal computer-compiler computest comskee comsl comsol-script comtran cona conan-center-pm conan-pm conc concept-script conceptual concert-c concise-encoding concordance concur concurnas concurr concurrent-cpp concurrent-metatem concurrent-ml concurrent-pascal concurrent-prolog cone confluence congolog conlan conll-u conman connection-machine-lisp connection-machine conniver consim constraintlisp constraints consul context-diff contracts.coffee contrans converge convert cooc cool coordinate-format copas cope copilot coq cor coral-64 coral-lang coral coralpp corbascript corc corelscript corescript corman-common-lisp cornell-university-programming-language corvision cosh cosmicos cosmo cosmos cotton couchbase-mobile couchbase couchdb coulombs-equation cowsel cp cpan-pm cperl cpl cpp cql cqlf cqlpp crack cram-format cran-pm cranelift-ir crates-pm creative-basic crema creole crmsh croc croma crush cryptol crystal cs-script csa csharp csl csmp cson csound csp-oz-dc csp-oz csp cspydr css-doodle css cssa cst csv csvpp csvw ct ctalk-lang ctalk ctan-pm ctr cubase cube cuda cuecat cuelang culler-fried-system cullinet cuneiform cupid cupit-2 curl curly curry curv cuscus cusip cvl cweb cx cyber cybil cycl cyclone cycript cymbal cypher cyphertext cython cytosol d-data-language-specification d d2 d3 d4-programming-language d4 dad dafny dag daisy-systems dak dale dalvik-bytecode daml-oil daml damn daonode dap-algol dap-fortran daplex darcs-patch darkbasic darklang dart-pm dart dartcvl dartmouth-basic das dashrep dasl dasm dat-protocol data-access-language data-general-business-basic data-text databus dataflex datafun datalisp datalog datan datapackage datapoint-dasl datascript datatrieve dataweave datev datomic dax dbase dbml dc dcalgol dcat dda ddfcsv ddfql ddml de-bruijn-index-notation deacon deb debl debuma dec64 decision-model-notation declare dedukti deesel definite-clause-grammar-notation del delirium delphi delta-prolog dem demeter demos dendral deno dependent-ml dern descartes descript descriptran desktop desmos detab-65 detab-x detap deva device-independent-file-format devicetree devil dex dexterity dexvis dfl dfns dgraph dhall diagram dialog diamag diana dibol dice diet diff differential-datalog digital-command-language digraf dinkc dinnerbell dino dio dipe-r diplans disc dispel displayport-standard distributed-processes distributed-smalltalk ditran ditroff-ffortid ditroff dixy django djangoql djot dkim-standard dllup dlp dlvm dm-1 dm dmap dml dna dns docker dockerfile docopt doe-macsyma dog dogescript doh doi dojo dokuwiki dolittle dollar-sign dolphin domino doml doodle dopl dot-product-equation dot-ql dot dowl dpp dprl draco-programming-language draconian dragonbasic dragoon drakon dreamlisp dribble drl drol drupal dscript dsd dsl-90 dslx dss dsym dtd dtrace dts dual dub-pm duel duro durra dvi-standard dwg dxf dylan dynamo-pm dynamo-visual-language dynamo dystal dyvil e eagle earl-grey eas-e ease easl easy-english easy easybuild easylanguage easytrieve ebg ebnf ec ecl eclectic-csp eclipse-command-language eclipse-editor ecmascript eco-editor ecological-metadata-language ecr ecsharp ect ed-editor eden edge-side-includes edgedb edgelisp edgeql edh edina edinburgh-imp edinburgh-lcf edison edje-data-collection edn edsac-initial-orders edscript edsim educe-star educe eex eff efl egel egison egl egs4 eiffel ejs el1 elan elastic-query-dsl election-markup-language electre elegance elegant elena elf elfe elixir ella-programming-language ellie elliott-algol ellpack elm-packages-pm elm elmol elpa-pm elpi elvish elymas em emacs-editor emacs-lisp emberjs-framework emberscript emerald-lang emerald emesh emfatic emily emma emojicode emoticon empirical emu encore energese-notation energy-momentum-equation english-programming-language eno enso-lang enso enterprise-mashup-markup-language entropy envoy-app epigram epilog epsilon eql eqlog eqn eqs equate erb erg erlang errol esc-p escapade-programming-language eskew esoteric-reaction esp espol esterel eta etc ethereum-vm ethernet etoys etruscan-numerals etude euboea euclid euclidean-geometry euler eulers-equation eulisp eumel euphoria eurisko eva eve everparse3d ex-editor exapt excel-app exec-2 executable-json exel exfat exkited expect explan explor explorer express expresso ext ext2 ext3 ext4 extempore extended-ml extended-pascal extensible-embeddable-language extran ez ezhil f-prime f-script f-sharp f fable-lang fable fac facelets fact-lang fact factor fad falcon false family-basic fancy fantom fap far faradays-induction-equation farcaster fardlang fast-fourier-transform-equation fasta-format fastq-format fasttrack-scripting-host fat faust fawlty fay fcl fcpu fe feel felix femtolisp fen-notation fenix-project fennel ferite fern ferret fetlang feynman-diagram ffmpeg fhir fibonacci-notation fibonacci fickle figlet-font filebench-wml filetab-d filetab filterscript firebase firefox firrtl fish fishlang fizz fjolnir fjs fl flacc flagship flame-ir flang flapjax flare flatbuffers flatline flavors fleck flengpp flex-lang flex flexbuffers flexml flic flix floorplan flora floral floscript flow-matic flow flow9 flowchart-fun flowcode flowgorithm flowlog flownet flownote flua flutter-framework flux-lang flux fm-standard fmj fml-lang fml fo foaf focal focus foil foogol foral-lp foral forall forest-database forest-lang forgebox-pm fork-lang fork fork95 formac formality formatted-table forml forms-3 formula forte-4gl forth forthnet-pm forthscript fortran-77 fortran-8x fortran-90 fortran-cep fortran-d fortran-ii fortran-iii fortran-iv fortran-m fortran fortransit fortress fossil-scm foundry fox foxpro fp fp2 fp3 fpgac fpp fractran frame framework-office-suite fran frank-lang frank free-pascal freebasic freebsd freefem freemarker frege frenetic fresco frink frost frtime fructure-editor fsl fstar ftp fun function-block-diagram funl futhark futurebasic futurescript fuzuli fuzzyclips fx-87 fxml fxscript g-2 g-code g-expressions g-fu g-portugol gaea gaiman galaksija-basic galileo gambas game-maker-language game-oriented-assembly-lisp game gamemonkey-script gamerlanguage gaml gams gap gargoyle garp gas gasp-ii gasp gat gauche gauss-flux-equation gauss-magnetism-equation gaussfit gcc-machine-description gcc gcla-ii gcp gdata gdb gdl gdpl gdscript geany-editor gecko gedanken gedit-editor gel gellish gello gem gema gemini-protocol general-algebraic-modeling-system generate-ninja generic-haskell generic genero genexus genie genius-extension-language genshi-text genshi genstat gentee gentoo-ebuild gentran-90 gentran geo-ml geogebra geojson george gerald gerber-image gerbil germinal gettext gfa-basic gff-format gfoo gforth gfs ghc gherkin ghidra-decompiler ghostscript gif-format gimple gintonic giotto gist git-config git gitignore gks glbasic gleam glicol glide glish glitch-editor glms gloss glpk-lib glsl glu glue-nail gluon glush glyph-bitmap-distribution-format glyph gnome-basic gns gnu-e gnu-rtl gnuplot go-bang go goal goby godel godot-game-engine gofer gogs-editor gold golfscript golo golog google-apps-script google-cloud-mysql google-cloud google-data-studio-app google-sheets-app goose gopher-protocol goql gorillascript gospel gosu gp gpds gpgs gps gpss-360 gpss-85 gpss-fortran gpss gql graal grace grad-assistant gradle grain grammar grammatical-framework graph-it graph-modeling-language grapheasy graphics-basic graphlog graphml graphos graphql-plus-minus graphql-sdl graphql graqula grass gravity-equation gravity greek-numerals green greenplum gremlin gren grep grid-notation gridstudio-editor grin grml groff groove groovy-server-pages groovy grouplog grunt gsbl gsql gtf-format guide guido-music-notation guile guix gura guru gvl gw-basic gwion gwl gxl gypsy gzip h-lang habit hac hack hackage-pm hackett hackppl hacspec haggis hakaru hal-format hal-s halide ham hamdown haml hamler hancock handel-c handlebars hank harbour hare harlan harvey harwell-boeing-format hascript hashlink haskell-sharp haskell hasklig hasl haste haxe haxelibs-pm haystaq hazel hbasic hcard hccb hcl hdf hdfs hdmi-standard hdt heap.coffee hecl hedy heic helang helena helium hello helper henk heraklit herbrand hermes heron-lang heron hex-pm hex-rays hexagon hexagony hfs-plus hfs hhvm hi-visual high-tech-basic highlightjs hilbert hilltop-lang hilvl hina hiq hivemind hiveql hjson hl7 hla hlasm hlsl hlvm hmmm hmsl hobbes hocon hodor hol holcf holo holonforth holyc homa homebrew-pm homespring honu hook hoon hoot-smalltalk hop hope hopscotch horse64 hotcocoalisp hotdog hp-basic-for-openvms hp-gl hp-pascal hp-time-shared-basic hpp hprl hr-code hrqr hsaml-format hscript hsl hsml hspec htel html htmx http-2 http-3 http httplang huginn hugo hujson humanhash-hash-function hummingbird-quickscript hurl hush huwcode hxml hy hybrid hycom hypac hyper-basic hypercard hyperflow hyperfun hyperlisp hyperlog hyperscript-lang hyperscript hypertalk hyphy hytime hytran i-expressions i ia-32 ial iam ib-templog ibex ibm-1401-symbolic-programming-system ibm-basic ibm-basica ibm-db2 ibm-gml ibm-i-control-language ibm-logo ibm-rational-sqabasic ibm-rpg ibm-system-38-language ibuki-cl icalendar-format icarus icd icedcoffeescript ices-system icetran ici icml icon icot id idio idl-sl idl idris ids idyll ifo ifps igor-pro iif iikuse iitran ikarus ilbm ilu ilx imac-machine image imaginary-number-equation imandra imap-protocol imba imf imp-lang imp imp72 impala impl ina-jo inc inchi incipit indental infer infiniband-standard influxdb infolog inform information-algebra information-processing-language information-theory-equation informix infusion-framework ingres ini ink-lang ink inko inmagic inno-setup inquire inscan insight insitux instruction-list integer-basic integral-equation intellijidea-editor interactive interbase intercal intercellas interchange-file-format intercons interleaved-notation interlisp-vax interlisp interpress interscript intersystems-cache intuitionistic invokator io iode ioke ion-schema ion ios iota-and-jot iota ip-pascal ipad-machine ipf ipfs iphone-machine ipl-v iptables-rope iptscrae ipv4 iqf iqr irc-log ircis isabelle-91 isabelle-hol isabelle isac isbl isbn iscript isetl isis islisp iso-8601 ispl isq iswim it iterm2 itl ivtran ivy ixml izibasic j jacal jacl jade jai jakt jal-compiler jammy janet jank janus-lang janus-programming-language jargon jasmin jasmine jasper jass java-bytecode java-ee-version-history java-properties java-server-pages java javacc javafx-script javaml javascript javascriptcore jaws-scripting-language jayfor jazz jbc jcard jcl jcof jean jedit-editor jedlang jeebox jeeves jekyll jelly jesth jet-propulsion-laboratory-display-information-system jevko jflex jfugue ji jingo jinja jinx jis-x-0201 jison-lex jison jisp jiyu jlang jmap jmespath jmp jmsl joe-e join-java joker jolie jonprl josie joss-ii joss joule jovial joy joyce joycep jpeg-format jpl jplace jpp jq jql jquery jr jruby jscript jsf jsgf jsharp jsil-compiler jsl jslt jsml json-graph-format json-graph-spec json-lambda json-ld json-schema json-script json-stat json-url json-with-comments json json5 jsoniq jsonnet jsparagus jspp jsx jsyn judoscript juicy jule julia-lang julia juliahub-pm juniper juno jupyter-editor jupyter-notebook just juttle juvix jvm jython k-framework k kaffeine kaggle-app kai kail kaitai kakoune-editor kal kaleidoquery kaleidoscope kaleidoscope90 kaleidoscope91 kalyn kamby kami kamilalisp kaml karel karl kasaya kate-editor kate katex kaukatcr kavascript kawa-scheme-implementation kayia kb kee kefir kei kek-nodal keli keras kerf kermeta kernel-e kernel kew keykit keysight-vee khepri ki kicad kid kiev kilo-lisp kima king-kong kiss kit kitlang kitten kivy-lang kixtart kl-one kl0 kl1 klaim klerer-may-system klipa klisp klong kml knight knitr knowledge-interchange-format ko koara kodu-game-lab kogut koi koka komodo-editor kona konna konsolscript korn-shell kotlin kqml krc kris krl-0 krl krs krypton ktexteditor-editor kubernetes kuin kuka kumir kuroko kvikkalkul kvsapi kylix kyma l l2 l6 labtran labview ladder-logic lagoona lain lambcalc lambda-obliv lambda-prolog lambda-zero lambda lamderp lamdu-editor lamdu lamina lammps-format lanai language-for-class-description language-h language-server-protocol laning-and-zierler-system lap laravel-framework larceny larch laris larp lasp lass lasso latex latino latte-js latte laure lav-format lava lawvere lazarus-editor lazy-k lazyml lc-3 lcf lcl ld-json ldap ldl ldl1 ldpl le-lisp leaf lean leap leazy leda legol lem-editor lemick lemon leo-editor leogo leopard les lesk lesma less lever levy lex lexon lexx-editor lezer lfe lg lgdf li-chen-wang liberty-basic libra libsvm-format life lift lighttpd-configuration-file ligo lil-pl lil lila-lang lila lily lilypond limbo limdep linc-4gl lincoln-reckoner lincos linda linden-scripting-language linearml lingo lingua-graphica link linked-markdown linker-script links-programming-language links linktext linoleum linotte linq linux-kernel-module linux liquid liquidity lis lisaac liseb liso lisp-1-5 lisp-2 lisp-a lisp-machine-lisp lisp lispme lisptalk lispworks lispyscript listdown lite-c literate-agda literate-coffeescript literate-haskell litescript lithe little-b little-smalltalk little livecode livescript livr lkif llhd lll lllpg llvmir lmdb lnf lo lobster local loci locomotive-basic locs logal logica logicon login logist loglan loglisp loglo logo logol logos logowriter logres logscheme logtalk lol lola-2 lola lolcode lookml loom loomscript loopnpp loops lore lorel-1 lorel lotis lotos lotusscript lowstar lpc lpl lrltran lsd lse lsif-format lsl lua luajit luarocks-pm luau lucene-query-syntax lucid-chart-app lucid-lang lucid-representations lucid lucinda luna-1 luna lunar lush lustre lux lyapas lygon lynx lyric lyx-editor m-expressions m-lisp m-programming-language m2001 m3db m4 m4sugar mac macaims macbasic macbook-air-machine macchiato mace machiavelli macintosh-common-lisp macintosh-machine macro-10 macro-11 macro-spitbol macro macroml macsyma mad madcap-vi madcap mads mages magic-paper magik magit magma magma2 magritte mai-basic-four mai make makedoc makefile mako mal malbolge mallard-basic malus mama-software man-machine-language manchester-syntax mangle manhood manim manool manticore manuscript map mapbasic maple maplesoft-app-center-pm mapper mapquery maps maraca-lang margin maria-db-column-store maria-xml mariadb mark-iv markdeep markdown marklogic marko markovjunior markus markwhen marlais marmot marp marsyas marten mary-2 mary mascara masim maskjs masm mass-energy-equation material-exchange-format math-matic mathcad mathematica-editor mathematica-packagedata-pm mathematica mathics mathjax mathlab mathlingua mathml mathpix-markdown mathsy mathtype mathworks-file-exchange-pm matita matlab matplotlib matrix-pascal matrix-protocol maude maven-pm maven-pom mavis mavo mawk max maxima maxscript maya mbasic mbox mckeeman-form mcleyvier-command-language mcobol md5-hash-function mdbs-qrs mdl mdx-lang mdx meanscriptcli mech-lang mediawiki medic medusa megalog megaparsec meld melody melpha-pm memcached memex-machine mendel mentat mercurial mercury-programming-system mercury merd mermaid meroon mesa meson messagepack met-english meta-assembler meta-ii meta-lisp meta-plus metacomco metafont metah metal-programming-language metal metalang99 metalex metaml metapi metapost metasim metatem metaweb-query-language methodology-description-language mewl mewmew mgmt mheg-5 michelson micro-cpp micro-editor micro-flowcharts micro-mitten micro-prolog microarchitecture-description-language microdare microdata microl microplanner micropython microsoft-access microsoft-azure-cosmos-db microsoft-basic microsoft-equation-editor microsoft-macro-assembler microsoft-mysql-server microsoft-small-basic microtal midas miis mike mime mimic mimium mimix-stream-language min minc mini-ml minid minidsdb minihaskell minikanren minilang miniml-error miniml minion miniprolog minivital minizinc minopt mint mips mir mirager mirah miranda miranim mirc mirfac mirth miso-framework miva mizar ml mlab mlatu mlir mlisp2 mlite mlpolyr mmix mmsearch mmx mobl-lang mobl moby-programming-language mochajs mochi mockingbird-notation mocklisp modcap model-204 model-k modelica modl modlisp modsim-iii modula-2 modula-2p modula-3-star modula-3 modula-p modula-r modula modular-prolog module-management-system moescript moinmoin mojo molecular-query-language molfile-format molog monaco mond monesa mongodb monkey monodevelop-editor monte moo mool moonrock-basic-compiler moonscript moose morfa morfik morphe morphism morse-code mortran motif-software mountain mouse mouse4 moxie moya mp3-format mpgs mpl mps mpsx mql mqtt mrdb ms2 mscgen msg-84 msl msp430 msx-basic mtml mu muddl mudlle muf mufp mul-t multi-user-basic multiaddr multibase multicodec multics multigame multihash-hash-function mumath mumps mums mun-lang munin muon mupad murmur-hash-function mushroom music-sp musicxml musimp musp mustache musys mvel mvl mxml mybb mycroft myghty myia mypy myrddin mys mysql mythryl n-prolog n-triples n nadesiko nail nakl nano-editor napier88 napss narpl nasal nasm nassi-shneiderman-charts native-structured-storage nato-phonetic-alphabet natural navier-stokes-equation nawk ncar-command-language ncl ndl nearley neater nebula nectar neeilang neko neliac nelua nemerle neo4j neovim-editor neralie-format nesc nesl ness nested-context-language nestedtext net-format netbasic netbeans-editor netform netlib netlinx netlogo netrexx netscript network-control-language neuronc neut neutron never newclay newick-format newlisp newp newspeak newsqueak newton newtonscript nexml nextflow nexus-format nfql nginx-config ngl-programming-language ngql ngs nhx nial nianiolang nice nickle nikl nil nilscript nim nimble-pm nimrod nimskull ninja nios nirvana nit nix nixos njcl nl nlpl nltk nml noah nodal nodejs noisecraft nomad-software noms-db none noodle nop-2 nord normal-distribution-equation northstar-basic nosica notation3 note notepad-editor notepad-plus-plus-editor noulith nova-editor noweb np npl-lang npl npm-pm npy nqc nrl nroff ns-basic nsis nsl ntfs ntp nu-prolog nu nua-prolog nuget-pm nul-lang nulan numba numbers-app numerica numpad numpy nuprl nushell nut nuua nvdl nwscript nxc nxt-g nydp nylo nymph nyquist o-matrix o-xml o o2 o42a oak oaklisp oasis-operating-system oasis oberon-2 oberon obj obj2 objdump object-definition-language object-oberon object-pascal object-query-language object-rexx object-z objectcharts objective-c objective-cpp objective-j objective-modula-2 objective-s objectlogo objectpal objectscript objectworld objvlisp objvprolog obliq obscure observable-lang obsidian ocaml occam-2 occam-pi occam ocl octave octopus octune odata odbc oden odin odrl oem ofl oforth ofx ogdl ognl ohaskell ohayo ohm oil ok oldas ole-protocol olga oli oliver olog om omar omega ometa omg-idl omgrofl omikron-basic omnimark omnis-studio omnitab-80 omnitab-ii omnitab one-man-language onex oniguruma onnx onyx ooc ook oolp oopal oops oopsilon oopsp ooxml opa opal opam-pm open-nn open-shading-language openada opencl opencomal opendoc-protocol openedge-advanced-business-language openexr-format opengl opengraph openlisp openmusic openrc-runscript openroad openscad openspice opentype-feature-file openvera operational-control-language operon opl-langage-informatique opl opp ops-3 ops ops5 optimization-programming-language optimized-systems-software optimj oracle-java oracle orange orc-format orc-lang orca-lang orca-pl orca order oregano org orient-db orient84-k orlog osiris osl-2 osql ottawa-euclid otter owbasic owen-lang owl-dl owl ox oxide oxygene oxyl oz p-cl p-prolog p-star p-tac p p3l p4 p4p package-control-pm packagist-pm pacmanconf pacol pact-i pact-ia pact pactolus padl-1 pailisp paisley palasm palcode palingol pamela pan pancode pandas pandoc-app pandora panon-1 panon-1b panther-lang paperalgo papyrus par paragon parallax-propeller parallel-ellpack parallel-pascal paralog-e parasail parasolid parenscript parenthetic pari-gp parlog parmod parquet parrot-assembly parrot-basic parrot-internal-representation parrot-vm parse-tree-notation parser partiql pascal-abc.net pascal-fc pascal-i pascal-mtp pascal-plus pascal-s pascal-sc pascal-script pascal-xsc pascal pascals-calculator-machine pasion pasro passambler passerine pasukon patch patchwork path-pascal pawn-scripting-language pawn paxscript pbasic pbm-format pbt-omega pclos pcn pcol pcpp pcrap pcre pdel pdf pdl-ada pdl pdp-11-machine pear-pm pearl pearscript pearson-correlation-coefficient-equation pebble peg pegasus-autocode pegjs pei penguor penrose peoplecode pep pep8 perfectscript peridot perl-6 perl-data-language perl petr pfort pfortran pgbouncer pgen pgm-format pgolog pgql pharen pharo phel phigs phocus phoenix-object-basic phorth php phpstorm-editor phylip phyloxml-format physictran pi-calculus pic-microcontroller pic picasso picat piccola pick-operating-system pickcode pickle-format pico picolisp pict pictol picturebalm pie-lang pie piet-programming-language pig pikachu pike pikelet pikt pilib pilot pin pinto pipelines pisc pit pixin pizza pkgconfig pl-0 pl-11 pl-as pl-c pl-exus pl-i-formac pl-i-subset-g pl-i pl-ll pl-m pl-p pl-s-ii pl-s pl-sql pl-x pl360 pl4 placa plaid-programming-language plain-english plain plam plan2d planguage planit plankalkul planner-73 planner plantuml plasma playground plb please-build please plex plexil pliant plink-bed-format plink-bim-format plink-fam-format plink-map-format plink-ped-format plist plot-lang plot plpgsql pluk plum plumb plunk plus plush plz pm2 pml png-format pnuts po pocket-smalltalk pod pod6 pogol pogoscript pointless polac polly poly polyglot-compiler polylith polymath polymorphic-programming-language polyp polytoil pomsky pony pop-11 pop-2 pop-pl pop-protocol popasm popcorn-linux poplog popr popsy port-alg portable-standard-lisp portal-langage pose post-canonical-system post-x postcss postgresql postscript potential potion pov-ray-sdl power-bi-app power-query-m powerbasic powerbuilder powerhouse-programming-language powerisa powerlanguage powerloom-knowledgebase powerpc powershell-gallery-pm powershell ppm-format pqq praat-script praxis-lang praxis preferred-executable-format preforth presto price-equation principle-of-sufficient-reason prism prisma-schema-language prismjs priz pro-star-c probevue proc-procedure-language processing processor-technology procfile procol prodel profit progol prograph progres progsbase proiv project-mentat prolog-d-linda prolog-elf prolog-iii prolog-kr prolog-linda prolog-pack-pm prolog prologpp promal promela prometheus prompter promql property-specification-language prophet proplan proset prosper protel proteus-programming-language protium proto-gnosis protobuf protos-l protosynthex proverif-lang providex prow proxy prql ps-algol psather pseint psg psi psl psyche-c psyche psyco pt ptx public-key-file pufft pug pumpkin punched-tape punycode puppet pure purebasic puredata purescript pursuit-pm push pv-wave pvs py pycharm-editor pycket pygmalion pygments pyke pypi-pm pyret-lang pyret pyrex pyth pythagorean-equation python-cl-compiler python-for-s60 python-format-spec python pytorch q-equational-programming-language q-gert q-sharp q qa4 qalb qas qb64 qbasic qbe qcl qed-editor qed-lang qfx qif qlisp qmake qml qoir qore qr-code qt qtscript quadril quaint-lang quaint quake quakec quanta quel query-by-example quexal quick-macros quickbasic quicklisp-pm quicksight-app quikscript quiktran quilt qunity quorum qute quty r r2ml r3 r4 ra rack racket raco-pm radish ragel rails rainbow raku ralph ramdascript ramen ramis-software raml rand-abel rant rapid rapidbatch rapidgen-rpl rapidq rapidwrite rapira raptor raptorjit rascal rascalmpl rason rasp ratfiv ratfor ratsno ravenscar-profile razor rbasic rbs rbscript rc rcpp rdata-format rdf-schema rdf rdfa rdml rdoc rds-format react-native readable-lisp readable real-time-cmix real-time-concurrent-c real-time-euclid real-time-mentat realbasic reason rebeca-modeling-language rebol rebus rec-sm rec-studio recfiles recol red-lang red redcode redis redpanda-app redprl redscript redshift reduce ref-arf refal refer refined-c reflex-framework reflisp reforth regent regex regina regulus reia reko-decompiler rel-english rel-lang rel relational-data-file relational-production-language relationlog relax relaxng relfun relix remix ren-c ren-notation renderman-shading-language renderscript renpy report-writer-language rescript resharper-editor rest restructuredtext retdec retroforth reuse-description-language reverse-polish-notation revit-app revolution-programming-language rexon rexx rf-maple rfc rgb-format rhet rhine rholang rhoscript rhtml ricscript rider-editor riff rigal rigc ring rio ripple risc-v rise rita rlab rlisp rlmeta rlox rmarkdown robic robomind robot-battle robotalk robotc robotframework robots.txt roc rocket rockstar-rkt rockstar rocky-mountain-basic roff roku-brightscript rol rol2 roman-abacus-machine roman-numerals ron roop root-format root-lib ros-msg roscoe rosetta-2 rosetta-smalltalk rosette-lang rosette rosie roslyn-compiler rouge roy royalscript rpg-ii rpg-iii rpl-lang rpl rpm-package-manager rpm-spec rpp rpscript rpython rql rsharp rsl rss rstudio-editor rt-aslan rt-cdl rt-z rtf rtl-2 rtp-protocol ru ruby-document-format ruby-mine-editor ruby rubygems-pm ruleml run-basic runcible runescript runic runiq runoff runrev ruri russell rust-hir rust-mir rust rustscript ruth rye s-algol s-expressions s-lang s-plus s-sl s-snobol s s2 s3 sa-c-programming-language sa saal sac-1 sac-2 sac-programming-language safari sagemath sako sale salem salsa saltstack sam-coupe sam-format sam76 saml sampletalk saol sap-hana sapphire sarl sartex sas sasl-programming-language sass sassy sather-k sather satysfi saustall savi sawzall sb-one sba sbasic sbcl sbml sbol scala-js scala scalpel scaml scan scat scenic schemal schemaorg schematron scheme-2-d scheme school schoonschip schrodingers-equation scieneer-common-lisp scikit-learn scil-vp scilab scipy scl sclipting scm scoop-pm scoop scopes score scrapscript scratch scratchpad-ii scratchpad screamer scribble scribe scrimshaw script scriptbasic scriptease scriptol scriptx scroll-lang scroll scsh scss sdf-format sdf sdl sdlbasic sdms sdtm search sectorc secure-operations-language sed seed7 segras self semanol semi-thue-system semicolon semver send-standard sensetalk sentient seph-programming-language sepi seq seque sequel-2 sequencel sequential-function-chart sequential-pascal serious service-modeling-language sespath sespool set-builder-notation setl setlog setlx setun seval seymour sgml sh sha-1-hash-function sha-2-hash-function sha-3-hash-function shacl shadama shade shaderlab shadow shakespeare-programming-language shakti sham shapefile shapeup shared-prolog sharpscript sheep-lang sheep sheerpower4gl shen shex shift shill shiv shml shoe short-code-computer-language shrdlu si-library si sibelius-software sibilant sidopsp sierra sieve sigma-76 signal sil sile silk sill siman-iv siman simcal simcode simdis simfactory simit simkin-programming-language siml-i simnet simodula simons-basic simpas simpl simple-binary-encoding simple-stackless-lisp simple simplescript simplictiy simpp simscript simul simula-67 simula simulink sina sinclair-basic sing-sharp singular siphash-hash-function siprol siri sisal sisc sitemap sixten sizzle sk8 sketchpad-iii sketchpad skew skil skip skookumscript skulpt sky sl sl5 slam-ii slang slash sleuth slice slick slideshow slim-framework slim-pl slim slip slips slog slony slope slpl smalgol smali small-c small-euclid small-x small smallbasic smalltalk-76 smalltalk-80 smalltalk-mt smalltalk-v smalltalk-yx smalltalk smalltalkhub-pm smallvdm smart smartgameformat smarts smartsheet-app smarty smdl smile smiles-format smithy smoke smolcs smpl smsl smt smtp smx-computer-language snakemake snap snaptag snbt snit snobat snobol snobol3 snobol4 snoop snostorm snowball-programming-language snowman-decompiler snql soap soaplang soar-ml social-networks-query-language socialite solaris-pm solaris solid solidity solmar son sophia soql-lang soql sora sorca sort-merge-generator sosl souffle soul soulver souper sourcelair-editor sourcepawn sourcetree southampton-basic-system sox soy sp-k space sparc spark-pl spark-pm spark sparqcode sparql spatial speakeasy spec-sharp spec specl specol specrtl speedcoding speedie spf-standard spice-lisp spice spider spiderbasic spidermonkey spil spill spin spip spir-v spir spiral spitbol spl splaw spline-font-database split-c sporth sprint sprite-os spry sps spss spyder-editor sqhtml sql-92 sql-psm sql sqlalchemy sqlar-format sqlite-storage-format sqlite sqlmp sqlpl sqr sqrl square squeak squidconf squiggle squire squirrel squoze squrl sr-programming-language sr srecode-template srl srv ssb ssc-pm ssharp ssi ssl-lang ssl ssml stacklang stackless-python stage2 stalin stan standard-lisp standard-ml staple star-prolog star starlark starlogo staroffice-basic starpial stata statebox statemate static-typescript statsplorer status-quo-function status-quo-script steinhaus-moser-notation stella stencil stl stockholm-format stoical ston stonecutter stoneknifeforth storymatic storyscript stos-basic strand-programming-language strat stratego strcmacs streamit streem strema stress string-diagrams-notation stringbean stringcomp stripe strips strongtalk structured-storage structured-text strudel strudl struql stutter-lang stx stylus sub subl subleq sublime-editor sublime-syntax-test sublime-syntax subrip-text subscript subtext subversion subx sue sugar sugarj sugarss sugartex sugi summer sun-raster-format suneido superbasic supercollider superforth superjson supermac superplan supertalk superxpp surge svelte svg svgbob svl sw2 swagger swallow sweave sweet-expressions sweetjs swi-prolog swift-il swift swizzle swrl swym sybyl-notation symbal symbmath symbol symbolic-assembly sympl sympy synapse synchronized-multimedia-integration-language syndicate synergist synglish synon synproc syntex syntol sysml system-v-abi systemverilog systemz t-lang t t2b t3x tab tablam tablatal tableau-app tablog tabloid tabsol tabtran tac tacl tacpol-programming-language tactics tads taf tahoe-lafs taichi taijilang taktentus tal tale tall tamgu tampio tangledown tao-lang tao tao3d tap-code tap taql tarmac tarot tasm tawa taxa taxis tbox-lib tcc tcl tcoz tcp tcsh tcsp tdfl tdms tea-pl tea-pm tea teal teasharp teco tefkat tektronix tela telcomp telefile-assembly telnet-protocol telos telsim templar template-attribute-language tempo temporal-prolog ten tengo tensorflow teradata-aster teradata tern ternary-notation terra terse tetra tetruss-app tex texpr text-executive-programming-language textadept-editor textframe texti textile textmate-editor texy tfl the-message-system theos-multi-user-basic thinbasic thinglab think-c thorn threaded-lists thrift tht thue-programming-language thune thymeleaf ti-89-basic ti-basic-assembly ti-basic tibbo-basic tibet tick-c tics tidb tiddler tiddlywiki tidyverse tiff-format tiger-basic tikiwiki tiledb tilton timber-programming-language timed-csp timpani tinkertoy tiny-basic tinyc-compiler tinygo-compiler tiscript titan titanium tl-isa tl tla tlc tldr tls tmg tmlanguage tmtp toadskin todotxt toffeescript toi toki-sona tom-oopl tom tomal toml toolbus toontalk topaz-lang topaz topshell torchscript tornado tosh touch touchdevelop toy-lang tpdl-star tql trac trace trafola-h traits tramp tranquil transact-sql transaction-language-1 transcode transforma translang tree-annotation-operator treelang treenotation treesheets treet trellis tremor-query trex tridash trig-syntax trio triple triroff triton troff tromp-diagrams trs-80-color-computer truck true-basic truth ts tsar tscript tsl tsql2 tsquery tsv ttcn ttm ttsneo tuple-space tuplemarkup turbo-assembler turbo-basic-xl turbo-basic turbo-pascal turing-plus turing turnstile-plus turnstile turtle tutor tutorial-d twelf twig twiki two-d twoducks txl txr txt2tags txtzyme tyco tymshare-superbasic tynker type-language typecastjs typecobol typedefs typescript typographical-number-theory typoscript typst tyruba u-datalog u uan ubasic ubercode uberscript ubik ubjson uc ucg ucl ucsd-pascal udp ufl ufo ugbasic ugnis uiml uiua ujml ulisp ultralisp-pm umka uml uml2-sp umple umta uncol underlay unicode-lang unicode unicon-adl unicon unicorn uniface unified-diff unified-parallel-c unisim unison unity-engine unity unity3d-asset universe unix unlambda unlws uno unql-lang unql unravel unrealscript unseemly up-arrow-notation upic urbiscript url urn urweb usb-standard uscript uscript2 usd ussa utc-format utf-8 utopia-84 uxf v-golf v-promela v-visual-language v v8 v8torque val-ii val vala vale-assembly vale varlist vba vbscript vcard vcf-format vcl vcpkg-pm vdm-sl vdscript vector-pascal vega-editor-app velato vely venus verifpal verilog verona verse versioned-text-markup-language verve vex vga-standard vhdl-ams vhdl vi-editor video vienna-definition-language vienna-fortran vigil vilnius-basic vim-editor vim-script vim-scripts-pm vimwiki violent-es viptran virgil viron virt visavis visdown vissim visual-basic.net visual-basic visual-dataflex visual-dialogscript visual-eiffel visual-foxpro visual-logic visual-objects visual-occam visual-paradigm-app visual-prolog visual-smalltalk-enterprise visual-studio-code-editor visual-studio-editor visual-studio-marketplace-pm visual-test visual visualworks viva vivaldi viz vlibtemplate vml volt vortex voxml vpl vrml vspl vsxu vtl-lang vtl vtml vuejs vulcan vvvv vyper vyxal w wah walt wart wasm wasmer wasp-lang wast watbol watcom water watfiv watfor wats wavefront-material wavefront-object wcl wcps wddx wdf wdl web-idl webdna webgl webkit webl webp-format webql webstorm-editor weebasic wescheme wgsl whack whalecalf whiley whirl whirlwind whitespace whois-protocol wikitax winbatch windev windows-registry-entries wing winwrap-basic winxed wireless-markup-language wirth-syntax-notation wisp wiswesser-line-notation wizml wizor wlambda wlanguage wml wmlscript woe wol wolfram wolontis-bell-interpreter wonkey woofjs wordpress work-flow-language workfl world-of-warcraft-addon-data world worst wren writeacourse wsdl wsfn-programming-language wu wxbasic wylbur wyvern x-basic x-bitmap-format x-bitmap x-font-directory-index x-it x-klaim x-pixmap x10 x11-basic x86-64-isa x86-assembly x86-isa xadl xaml xbase xbasepp xbasic xbel xbl xblite xbrl xc xcard xcas xcompose xcore xcy xdr xduce xe xetex xgboost-model xgboost xgmml xhtml xidoc xl-lang xl xlwings-editor xmi xmind xml-gl xml-ql xml-query-algebra xml xmpp-protocol xmtc xoc-compiler xodio xojo xotcl xpages xpath xpl xpl0 xpm-format xpop xproc xprofan xql-lang xql xquery xs-lang xs xsd xsharp xsim xslt xsv-app xt3d xtao xtclang xtend xtext xtran xuml xupdate xxl y-lang y yabasic yacas yacc yakou-lang yaml yamp yang yap-prolog yara yarv yasl yasnippet yawl ycp yedalog yess yeti yii yinyang yoga yoix yoptascript yorick yugabytedb yum-pm z-expressions z-flat z-machine z-notation z-shell z z2 z80 zbasic zccs zed zeek zeno zenscript zephir zephyr-asdl zeta zgrass zig zigzag zil zim-format zimbu zimpl zip-format zish zl zlang zoem zolang zone zonnon zope zopl zot zpl zpp zuo zz
urlCell
 highlightScope constant.language
 regex (ftp|https?)://.+
externalGuidCell
 description A GUID from another site.
fileNameCell
 highlightScope string
abstractTrueBaseColumnParser
 cells columnNameCell
 string typeForCsvDocs unspecified
 cruxFromId
 boolean isColumn true
 single
 javascript
  get columnValue() {
   return this.content
  }
  get columnName() {
   return this.definition.cruxPathAsColumnName
  }
abstractUrlColumnParser
 string typeForCsvDocs url
 cells columnNameCell urlCell
 extends abstractTrueBaseColumnParser
annualReportsUrlParser
 extends abstractUrlColumnParser
 description What is a URL to annual reports for this language?
 single false
abstractUrlGuidColumnParser
 description A column containing a URL that is also a Globablly Unique Identifier (GUID) for an entity on that site.
 extends abstractUrlColumnParser
antlrParser
 extends abstractUrlGuidColumnParser
 description What is a URL to an ANTLR grammar for this language?
 // A good collection of ANTLR grammars: https://github.com/antlr/grammars-v4/tree/master/LANGUAGE)
 string sourceDomain www.antlr.org
hoplParser
 extends abstractUrlGuidColumnParser
 description What is the URL to this language in Diarmuid Pigott's Online Historical Encyclopaedia of Programming Languages site?
 string sourceDomain hopl.info
jupyterKernelParser
 extends abstractUrlGuidColumnParser
 single false
 description What is a link to a Jupyter Kernel for this language?
 string sourceDomain jupyter.org
meetupParser
 description What is a URL for active meetup groups for this language on Meetup.com?
 extends abstractUrlGuidColumnParser
 contentKey url
 string sourceDomain meetup.com
 memberCountParser
  description How many people in this meetup group?
  extends abstractPopulationCountColumnParser
 groupCountParser
  description How many groups?
  extends abstractCountColumnParser
subredditParser
 extends abstractUrlGuidColumnParser
 string sourceDomain reddit.com
 contentKey url
 single false
 description What is a URL of a subreddit(s) for this language?
 example
  subreddit php
 memberCountParser
  extends abstractAnnualPopulationCountMapParser
  description How many members in this subreddit?
replitParser
 extends abstractUrlGuidColumnParser
 description What is a URL to try this language on replit.com?
 string sourceDomain replit.com
rosettaCodeParser
 extends abstractUrlGuidColumnParser
 description What is a URL to this language on Rosetta Code - http://www.rosettacode.org/?
 string sourceDomain rosettacode.org
twitterParser
 extends abstractUrlGuidColumnParser
 description What is a URL to the official Twitter account of this thing, if any?
 string sourceDomain twitter.com
 followersParser
  description How many followers does the linked account have?
  extends abstractPopulationCountColumnParser
abstractChatUrlColumnParser
 description What is a URL to a chat room about the language?
 extends abstractUrlColumnParser
 // todo remove the need for the below from grammar
 string sortKey abstractChatUrlColumnParser
discordParser
 extends abstractChatUrlColumnParser
 description What is a URL to an official (or popular unofficial) Discord for this language?
discourseParser
 extends abstractChatUrlColumnParser
 description What is a URL to an official (or popular unofficial) Discourse for this language?
ircParser
 extends abstractChatUrlColumnParser
 description What is a link to an official (or popular unofficial) IRC channel(s) for language development?
zulipParser
 extends abstractChatUrlColumnParser
 description What is a URL to an official (or popular unofficial) Zulip for language development?
cheatSheetUrlParser
 extends abstractUrlColumnParser
 single false
 description What is a URL to a cheat sheet for this language?
conferenceParser
 description What is a URL to a recurring conference(s) focused on this language?
 catchAllCellType conferenceNameCell
 extends abstractUrlColumnParser
 single false
demoVideoParser
 description What is a URL of a demo video of this language?
 extends abstractUrlColumnParser
 single false
documentationParser
 extends abstractUrlColumnParser
 description What is a URL to the official documentation for this language?
 single false
devDocumentationParser
 extends abstractUrlColumnParser
 description What is a URL to the official documentation for developers who want to contribute to the language project?
 single false
downloadPageUrlParser
 extends abstractUrlColumnParser
 description What is a URL to the download page for this language?
 single false
ebookParser
 extends abstractUrlColumnParser
 description What is a link to a free public domain high quality eBook about this language?
emailListParser
 extends abstractUrlColumnParser
 description What is a link to the mailing list for this language?
 single false
esolangParser
 extends abstractUrlColumnParser
 description What is a URL to this language on https://esolangs.org/?
 string sourceDomain esolangs.org
eventsPageUrlParser
 extends abstractUrlColumnParser
 description What is a URL to an events pages for this language?
 single false
faqPageUrlParser
 extends abstractUrlColumnParser
 description What is a URL to a frequently asked questions page for this language?
 single false
abstractGitRepoUrlColumnParser
 extends abstractUrlColumnParser
 // todo remove the need for the below from grammar
 string sortKey abstractGitRepoUrlColumnParser
gitRepoParser
 description What is the URL of the official git repo for the language project if not hosted on GitHub or GitLab or Sourcehut?
 extends abstractGitRepoUrlColumnParser
githubRepoParser
 description What is the URL of the official GitHub repo for the project if it is hosted there?
 extends abstractGitRepoUrlColumnParser
 cells columnNameCell githubRepoUrlCell
 inScope descriptionParser
 contentKey url
 string sourceDomain github.com
 createdParser
  extends abstractYearColumnParser
  description When was the *Github repo* for this entity created?
 updatedParser
  extends abstractYearColumnParser
  description What year was the last commit made?
 firstCommitParser
  extends abstractYearColumnParser
  description What year the first commit made in this git repo?
 subscribersParser
  extends abstractCountColumnParser
  description How many subscribers to the repo?
 forksParser
  extends abstractCountColumnParser
  description How many forks of the repo?
 starsParser
  extends abstractCountColumnParser
  description How many stars of the repo?
 issuesParser
  extends abstractCountColumnParser
  description How many isses on the repo?
gitlabRepoParser
 description What is the URL of the official GitLab repo for the language project?
 extends abstractGitRepoUrlColumnParser
 string sourceDomain gitlab.com
sourcehutRepoParser
 description What is the URL of the official sourcehut repo for this project?
 extends abstractGitRepoUrlColumnParser
 string sourceDomain sr.ht
gourceParser
 description What is a URL to a Gource visualization of this project's git history?
 extends abstractUrlColumnParser
 string sourceDomain gource.io
firstAnnouncementParser
 description What is a URL announcing the creation or release of this language?
 extends abstractUrlColumnParser
screenshotParser
 description What is a URL to a screenshot of this visual language in the form https://pldb.com/screenshots/[id].png?
 extends abstractUrlColumnParser
photoParser
 description What is a URL to a screenshot of this real world notation in the form https://pldb.com/photos/[id].png?
 extends abstractUrlColumnParser
languageServerProtocolProjectParser
 extends abstractUrlColumnParser
 inScope writtenInParser
 single false
 description What is the URL to a project implementing LSP for this language?
 string sourceDomain langserver.org
linguistGrammarRepoParser
 description What is the URL to the Linguist Grammar repo used by GitHub for this language?
 // Linguist is a library used by GitHub to syntax highlight files on GitHub via a grammar. The list of languages supported by Linguist and the grammar package used for each language is listed here: https://github.com/github/linguist/blob/master/vendor/README.md. If Linguist has support for a language, it will have a repo on GitHub. Given a language is supported by Linguist, that is a good indication it has at least 200 unique :user/:repo repositories, according to their docs.
 extends abstractUrlColumnParser
 cells columnNameCell urlCell
 contentKey url
 string sourceDomain github.com
 inScope exampleParser
 commitCountParser
  description How many commits in this repo?
  extends abstractCountColumnParser
 firstCommitParser
  description What year was the first commit made?
  extends abstractYearColumnParser
 lastCommitParser
  description What year was the last commit made?
  extends abstractYearColumnParser
 sampleCountParser
  description How many language samples in this repo?
  extends abstractCountColumnParser
 committerCountParser
  description How many people have made commits in this repo?
  extends abstractPopulationCountColumnParser
officialBlogUrlParser
 extends abstractUrlColumnParser
 description What is the URL to the official blog for this language?
 single false
packageRepositoryParser
 extends abstractUrlColumnParser
 description What is a URL to the package repository for this language?
 single false
proposalsParser
 extends abstractUrlColumnParser
 description What is the URL to a the place where language proposals are made, if one exists?
redditDiscussionParser
 description What is a link to a related discussion on reddit?
 extends abstractUrlColumnParser
 string sourceDomain reddit.com
 single false
referenceParser
 extends abstractUrlColumnParser
 description What is a URL to more info about this thing?
 // You can add raw links and then auto "upgrade" them using some of the importer code.
 single false
releaseNotesUrlParser
 extends abstractUrlColumnParser
 description What is the URL to the release notes or changelog for this language?
rijuReplParser
 extends abstractUrlColumnParser
 description What is a URL to try this language on riju.codes?
 string sourceDomain riju.codes
 contentKey id
 inScope fileExtensionsParser descriptionParser websiteParser gitRepoParser exampleParser
roadmapParser
 extends abstractUrlColumnParser
 description What is the URL to a public roadmap page for this language, if one exists?
specParser
 extends abstractUrlColumnParser
 description What is a URL to the official spec for this language?
websiteParser
 description What is the URL of the official homepage for this language project?
 extends abstractUrlColumnParser
webReplParser
 extends abstractUrlColumnParser
 description What is a URL for an online repl of this language?
 single false
wikipediaParser
 inScope fileExtensionsParser exampleParser
 extends abstractUrlColumnParser
 description What is the URL of this entity on Wikipedia, if and only if it has a page dedicated to it?
 cells columnNameCell urlCell
 string sourceDomain wikipedia.org
 contentKey url
 relatedParser
  description What languages does Wikipedia have as related?
  extends abstractTrueBaseLinksColumnParser
 summaryParser
  description What is the text summary of the language from the Wikipedia page?
  extends abstractStringColumnParser
 createdParser
  extends abstractYearColumnParser
  description When was the *Wikipedia page* for this entity created?
 appearedParser
  extends abstractYearColumnParser
  description When does Wikipedia claim this entity first appeared?
 dailyPageViewsParser
  extends abstractCountColumnParser
  description How many page views per day does this Wikipedia page get? Useful as a signal for rankings. Available via WP api.
 backlinksCountParser
  extends abstractCountColumnParser
  description How many pages on WP link to this page?
 revisionCountParser
  extends abstractCountColumnParser
  description How many revisions does this page have?
 pageIdParser
  extends abstractIntColumnParser
  description What is the internal ID for this entity on WP?
abstractBooleanColumnParser
 string typeForCsvDocs boolean
 cells columnNameCell boolCell
 extends abstractTrueBaseColumnParser
abstractFeatureParser
 extends abstractBooleanColumnParser
 contentKey value
 childrenKey example
 catchAllParser featureExampleCodeParser
 string sortKey abstractFeatureParser
canDoShebangParser
 extends abstractFeatureParser
 description Does this language support shebang executable scripts?
 string title Shebang
 string pseudoExample #! /run
 string reference https://en.wikipedia.org/wiki/Shebang_(Unix)
canReadCommandLineArgsParser
 description Does this language support command line arguments?
 extends abstractFeatureParser
canUseQuestionMarksAsPartOfIdentifierParser
 description Is the question mark (?) allowed as part of an identifier?
 extends abstractFeatureParser
canWriteToDiskParser
 extends abstractFeatureParser
 description Does this language have methods or standard libraries for writing to disk?
 string title Disk Output
 string pseudoExample write("pldb.csv", "...")
hasAbstractTypesParser
 extends abstractFeatureParser
 description Does this language have a keyword for abstract classes or types?
 string title Abstract Types
 string pseudoExample abstract class PLDBFile {}
 string reference https://en.wikipedia.org/wiki/Abstract_type
hasAccessModifiersParser
 extends abstractFeatureParser
 string title Access Modifiers
 description Does this language have access modifiers?
 string pseudoExample class PLDBFile { public title }
 string reference https://en.wikipedia.org/wiki/Access_modifiers
hasAlgebraicTypesParser
 extends abstractFeatureParser
 string title Algebraic Data Type
 description Does this language support algebraic types?
 string pseudoExample garageContents = empty | vehicle
 string reference https://en.wikipedia.org/wiki/Algebraic_data_type
hasAnonymousFunctionsParser
 extends abstractFeatureParser
 string title Anonymous Functions
 description Does the language support anonymous functions, aka Lambdas?
 string aka Lambdas
 string pseudoExample () => printPldb()
 string reference https://en.wikipedia.org/wiki/Anonymous_function
hasArraySlicingSyntaxParser
 extends abstractFeatureParser
 description Does the language have array slicing syntax, such as [0:2]?
hasAssertStatementsParser
 extends abstractFeatureParser
 description Does the language have built in assert statements?
 string title Assert Statements
 string reference https://en.wikipedia.org/wiki/Debug_code#Assert_Statements
 string pseudoExample assert(isTrue)
hasAssignmentParser
 extends abstractFeatureParser
 description Does the language allow assigning values to variables?
 string title Assignment
 string pseudoExample name = "PLDB"
 string tokenKeyword assignmentToken
 string reference https://en.wikipedia.org/wiki/Assignment_(computer_science)
hasAsyncAwaitParser
 extends abstractFeatureParser
 description Does the language have an async/await construct?
 string title Async Await
 string pseudoExample async downloadPldb => await getFiles()
 string reference https://en.wikipedia.org/wiki/Async/await
hasBinaryNumbersParser
 extends abstractFeatureParser
 description Does the language have a type and syntax for binary numbers?
 string title Binary Literals
 string pseudoExample 0b100110100000110011110010010
 string reference https://en.wikipedia.org/wiki/Binary_number
hasBinaryOperatorsParser
 extends abstractFeatureParser
 description Does the language have operators for operating on binary types?
 string title Binary Operators
 string pseudoExample 1 + 1
 string reference https://en.wikipedia.org/wiki/Binary_operation
hasBitWiseOperatorsParser
 extends abstractFeatureParser
 string title Bitwise Operators
 description Does the language have operators for bitwise manipulations?
 string reference https://en.wikipedia.org/wiki/Bitwise_operations_in_C https://en.wikipedia.org/wiki/Bitwise_operation
 string pseudoExample 3 == (2 | 1)
hasBlobsParser
 description Does the language have a blobs concept?
 extends abstractFeatureParser
hasBooleansParser
 extends abstractFeatureParser
 description Does the language have a type and syntax for booleans?
 string title Booleans
 string pseudoExample pldb = true
 string tokenKeyword booleanTokens
 string reference https://en.wikipedia.org/wiki/Boolean_data_type
hasBoundedCheckedArraysParser
 description Are array boundaries checked by the language?
 extends abstractFeatureParser
hasBreakParser
 description Does the language have a keyword for breaking out of a loop?
 extends abstractFeatureParser
hasBuiltInRegexParser
 description Does the language include/import a regular expression language?
 extends abstractFeatureParser
hasCaseInsensitiveIdentifiersParser
 extends abstractFeatureParser
 description Are identifiers in this language case insensitive?
 string title Case Insensitive Identifiers
 string reference https://rosettacode.org/wiki/Case-sensitivity_of_identifiers
 string pseudoExample pLdB = "PLDB"
hasCharactersParser
 extends abstractFeatureParser
 description Does this language have a syntax and type for a "character"?
 string title Characters
 string pseudoExample char character = 'P';
 string reference https://en.wikipedia.org/wiki/Character_(computing)
hasClassesParser
 extends abstractFeatureParser
 description Does the language have a concept of classes?
 string title Classes
 string pseudoExample class PLDBFile {}
 string reference https://en.wikipedia.org/wiki/Class_(computer_programming)
hasClobsParser
 extends abstractFeatureParser
 description Does the language have a specific type for character large object?
 string title Clobs
 string aka Character large objects
 string pseudoExample class PLDBFile {}
 string reference https://en.wikipedia.org/wiki/Character_large_object
hasCommentsParser
 extends abstractFeatureParser
 description Does the language have a syntax and support for comments?
 string title Comments
 string reference https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments https://en.wikipedia.org/wiki/Comment_(computer_programming)
 string pseudoExample # Hello PLDB
hasConditionalsParser
 extends abstractFeatureParser
 description Does the language have conditional statements and/or conditional expressions?
 string title Conditionals
 string pseudoExample if (isTrue) printPldb()
 string reference https://en.wikipedia.org/wiki/Conditional_(computer_programming)
hasConstantsParser
 extends abstractFeatureParser
 description Does the language have a way to declare constant compile time variables?
 string title Constants
 string pseudoExample const name = "PLDB"
 string reference https://en.wikipedia.org/wiki/Const_(computer_programming)
hasConstructorsParser
 extends abstractFeatureParser
 description Does the language have a syntax and/or notion of constructors?
 string title Constructors
 string pseudoExample PLDBFile { constructor() {} }
 string reference https://en.wikipedia.org/wiki/Constructor_(object-oriented_programming)
hasContinueParser
 description Does the language have a syntax/keyword for continuing a loop?
 extends abstractFeatureParser
hasDecimalsParser
 description Does the language have a decimal data type?
 extends abstractFeatureParser
 string title Decimals
 string pseudoExample 0.80766866
 string reference https://en.wikipedia.org/wiki/Decimal_data_type
hasDefaultParametersParser
 extends abstractFeatureParser
 description Does the language have a way to define default parameters for functions?
 string title Default Parameters Pattern
 string reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
 string pseudoExample say(message = "Hello PLDB")
hasDependentTypesParser
 extends abstractFeatureParser
 description Does a language have types who's definition depends on its value or the value of other types?
 string title Dependent types
 string pseudoExample pldbSortedList // a list where is sorted is true
 string reference https://en.wikipedia.org/wiki/Dependent_type
hasDestructuringParser
 extends abstractFeatureParser
 description Does the language have a syntax for conveniently extracting multiple values from a structure?
 string title Destructuring
 string website https://github.com/facebook/reason
 string reference https://reasonml.github.io/docs/en/destructuring
 string pseudoExample {title, rank} = pldbFile
hasDirectivesParser
 extends abstractFeatureParser
 description Is the language embedded in a tiny compile-time directive language?
 string title Directives
 string pseudoExample use strict;
 string reference https://en.wikipedia.org/wiki/Directive_(programming)
hasDisposeBlocksParser
 extends abstractFeatureParser
 description Does the language have a syntax for dispose blocks to free up resources allocated during execution?
 string title Dispose Blocks Pattern
 string pseudoExample with pldb: do computeRanks()
 string reference https://en.wikipedia.org/wiki/Dispose_pattern
hasDocCommentsParser
 extends abstractFeatureParser
 description Is there a standard mini language written in comments for documenting code?
 string title Doc comments
 string pseudoExample // param1: A comment about the first param
hasDuckTypingParser
 extends abstractFeatureParser
 description Are types defined not by their name, but by the presence of certain methods and properties?
 string title Duck Typing
 string pseudoExample length() // makes me an iterator
 string reference https://en.wikipedia.org/wiki/Duck_typing
hasDynamicPropertiesParser
 extends abstractFeatureParser
 description Does all properties have to be declared or does the language support dynamic properties?
 string title Dynamic Properties
 string pseudoExample pldb.score = 50
hasDynamicSizedArraysParser
 description Do arrays have to have their size specified at compile time or can they be dynamically sized?
 extends abstractFeatureParser
hasDynamicTypingParser
 description Are types of variables fixed or can they change during runtime?
 extends abstractFeatureParser
hasEnumsParser
 extends abstractFeatureParser
 description Does the language have a syntax and type for enums?
 string title Enums
 string reference https://en.wikipedia.org/wiki/Enumerated_type
 string pseudoExample colorsEnum { "red", "white", "blue"}
hasEscapeCharactersParser
 description Does the language have any notion of escape characters?
 extends abstractFeatureParser
hasExceptionsParser
 extends abstractFeatureParser
 description Does the language have a concept and syntax for exceptions?
 string title Exceptions
 string pseudoExample throw new Error("PLDB uh oh")
 string reference https://en.wikipedia.org/wiki/Exception_handling
hasExplicitTypeCastingParser
 extends abstractFeatureParser
 description Does the language have a syntax for type casting?
 string title Type Casting
 string pseudoExample (float)pldbRank;
 string reference https://en.wikipedia.org/wiki/Type_conversion
hasExportsParser
 description Does the language have a syntax for explicitly exporting items from a module or file?
 extends abstractFeatureParser
hasExpressionsParser
 extends abstractFeatureParser
 description Does the language have a concept of expressions?
 string title Expressions
 string pseudoExample (1 + 2)
 string reference https://en.wikipedia.org/wiki/Expression_(computer_science)
hasFirstClassFunctionsParser
 extends abstractFeatureParser
 description Does the language have functions that can be passed as arguments to other functions, can be returned by other functions, and can be assigned to variables or stored in data structures?
 string title First-Class Functions
 string pseudoExample [2.1].map(Math.round)
 string reference https://en.wikipedia.org/wiki/First-class_function
hasFixedPointParser
 extends abstractFeatureParser
 description Does the language have a type and syntax for fixed point numbers, such as currencies with 2 decimal points?
 string title Fixed Point Numbers
 string pseudoExample 80766866.00
 string reference https://en.wikipedia.org/wiki/Fixed-point_arithmetic
hasFloatsParser
 extends abstractFeatureParser
 description Does the language have a syntax and type for floating points?
 string title Floats
 string reference https://evanw.github.io/float-toy/ https://en.wikipedia.org/wiki/Floating-point_arithmetic
 string pseudoExample 80766866.0
hasFnArgumentsParser
 description Do functions accept arguments?
 extends abstractFeatureParser
hasForEachLoopsParser
 description Does the language have a concept and syntax for for-each loops?
 extends abstractFeatureParser
hasForLoopsParser
 description Does the language have a concept of and syntax for for-loops?
 extends abstractFeatureParser
hasFunctionCompositionParser
 extends abstractFeatureParser
 description Can you pass functions into other functions and get new combined functions?
 string title Function Composition
 string pseudoExample o = (f, g) => x => f(g(x))
 string reference https://en.wikipedia.org/wiki/Function_composition_(computer_science)
hasFunctionOverloadingParser
 extends abstractFeatureParser
 description Can you have multiple functions with the same name but different parameters?
 string title Function Overloading
 string reference https://en.wikibooks.org/wiki/Introduction_to_Programming_Languages/Overloading https://en.wikipedia.org/wiki/Function_overloading
 string aka Ad hoc polymorphism
 string pseudoExample add(string: str, string2: str)
hasFunctionsParser
 extends abstractFeatureParser
 description Does the language have a concept of and syntax for functions?
 string title Functions
 string aka routines
 string aka procedures
 string aka methods
 string pseudoExample function computePLDBRanks() {}
 string reference https://en.wikipedia.org/wiki/Subroutine
hasGarbageCollectionParser
 extends abstractFeatureParser
 description Does the language have a garbage collector or must memory of constructs be managed manually?
 string title Garbage Collection
 string pseudoExample var iDontNeedToFreeThis
 string reference https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)
hasGeneratorsParser
 extends abstractFeatureParser
 description Does the language have a concept of loops that yield?
 string title Generators
 string pseudoExample yield 2
 string reference https://en.wikipedia.org/wiki/Generator_(computer_programming)
hasGenericsParser
 extends abstractFeatureParser
 description Does the language have generics?
 string title Generics
 string pseudoExample function identity<T>(arg: T): T
 string reference https://en.wikipedia.org/wiki/Generic_programming
hasGlobalScopeParser
 description Is there at least one top level scope?
 extends abstractFeatureParser
hasGotosParser
 extends abstractFeatureParser
 description Does the language have a concept of and syntax for gotos?
 string title Gotos
 string pseudoExample goto 10
 string reference https://en.wikipedia.org/wiki/Goto
hasHereDocsParser
 extends abstractFeatureParser
 description Does the language have a syntax for multiline text blocks?
 string title Here Document
 string reference https://en.wikipedia.org/wiki/Here_document
 string pseudoExample \`A big multliline text block\`
hasHexadecimalsParser
 extends abstractFeatureParser
 description Does the language have a syntax for hexadecimals?
 string title Hexadecimals
 string aka Base16
 string aka hex
 string pseudoExample 0x4D06792
 string reference https://en.wikipedia.org/wiki/Hexadecimal
hasHomoiconicityParser
 extends abstractFeatureParser
 description Is the language also a valid data structure in that language?
 string title Homoiconicity
 string pseudoExample (list ())
 string reference https://en.wikipedia.org/wiki/Homoiconicity
hasIdsParser
 description Does the language have a concept of unique identifiers?
 extends abstractFeatureParser
hasIfElsesParser
 description Does the language have if-else statements or expressions?
 extends abstractFeatureParser
hasIfsParser
 description Does the language have "if" statements or expressoins?
 extends abstractFeatureParser
hasImplicitArgumentsParser
 extends abstractFeatureParser
 // todo: should we remove this one? I would have thought it was referring to something like an "arguments" implicit parameter
 description Does the language have a concept of contextual or implicit parameters?
 string title Implicit Arguments
 string reference https://docs.scala-lang.org/tour/implicit-parameters.html
 string pseudoExample shout(implicit message: string)
hasImplicitTypeConversionsParser
 extends abstractFeatureParser
 description Does the language automatically convert types as needed?
 string title Implicit Type Casting
 string reference https://en.wikipedia.org/wiki/Type_conversion
 string pseudoExample console.log("hello " + 2)
hasImportsParser
 extends abstractFeatureParser
 description Does this language have a syntax for importing other files?
 string title File Imports
 string pseudoExample import pldb
 string tokenKeyword includeToken
hasIncrementAndDecrementOperatorsParser
 extends abstractFeatureParser
 description Does this language have increment and decrement operators?
 string title Increment and decrement operators
 string pseudoExample i++
 string reference https://en.wikipedia.org/wiki/Increment_and_decrement_operators
hasInfixNotationParser
 extends abstractFeatureParser
 description Does this language use operators between operands?
 string title Infix Notation
 string pseudoExample 1 + 2
 string reference https://en.wikipedia.org/wiki/Infix_notation
hasInheritanceParser
 extends abstractFeatureParser
 description Does this language have class inheritance?
 string title Inheritance
 string pseudoExample class PLDBFile extends File
 string reference https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
hasIntegersParser
 extends abstractFeatureParser
 description Does this language have a syntax and type for integers?
 string title Integers
 string pseudoExample 80766866
 string reference https://en.wikipedia.org/wiki/Integer_(computer_science)
hasInterfacesParser
 extends abstractFeatureParser
 description Does this language have a concept of interfaces?
 string title Interfaces
 string pseudoExample interface PLDBFile
 string reference https://en.wikipedia.org/wiki/Protocol_(object-oriented_programming)
hasIteratorsParser
 extends abstractFeatureParser
 description Does this language have iterators?
 string title Iterators
 string pseudoExample for lang in pldb()
 string reference https://en.wikipedia.org/wiki/Iterator
hasLabelsParser
 extends abstractFeatureParser
 description Does the language have a way to label locations within the source code?
 string title Labels
 string pseudoExample mainFn:
 string reference https://en.wikipedia.org/wiki/Label_(computer_science)
hasLazyEvaluationParser
 extends abstractFeatureParser
 description Does the language wait to evaluate expressions until needed?
 string title Lazy Evaluation
 string pseudoExample print(range(1000000)[2])
 string reference https://en.wikipedia.org/wiki/Lazy_evaluation
hasLineCommentsParser
 extends abstractFeatureParser
 description Does the language have line comments?
 string title Line Comments
 string reference https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments
 string pseudoExample # Hello PLDB
 string tokenKeyword lineCommentToken
hasListsParser
 extends abstractFeatureParser
 description Does the language have lists?
 string title Lists
 string aka array
 string aka vector
 string aka sequence
 string pseudoExample [2, 3, 10]
 string reference https://en.wikipedia.org/wiki/List_(abstract_data_type)
hasMacrosParser
 extends abstractFeatureParser
 description Does the language have a compile-time macro pass?
 string title Macros
 string pseudoExample #define pldbItems 4000
 string reference https://en.wikipedia.org/wiki/Macro_(computer_science)
hasMagicGettersAndSettersParser
 extends abstractFeatureParser
 description Does the language have a way to handle undefined getters and setters?
 string title Magic Getters and Setters
 string reference https://www.php.net/manual/en/language.oop5.overloading.php#object.get
 string pseudoExample get(name) => obj[name]
hasManualMemoryManagementParser
 extends abstractFeatureParser
 description Does the language have manual memory management?
 string title Manual Memory Management
 string pseudoExample malloc(4);
 string reference https://en.wikipedia.org/wiki/Manual_memory_management
hasMapFunctionsParser
 extends abstractFeatureParser
 description Does the language support running map over a list?
 string title Map Functions
 string pseudoExample pldbFiles.map(downloadFilesFn)
 string reference https://en.wikipedia.org/wiki/Map_(higher-order_function)
hasMapsParser
 extends abstractFeatureParser
 description Does the language have a map (aka hashtable) data structure?
 string title Maps
 string aka dict
 string aka dictionary
 string aka object
 string aka record
 string aka struct
 string aka hashtable
 string aka keyed list
 string aka associative array
 string pseudoExample {name: "PLDB"}
 string reference https://en.wikipedia.org/wiki/Associative_array
hasMemberVariablesParser
 extends abstractFeatureParser
 description Does the language have member variables?
 string aka properties
hasMessagePassingParser
 extends abstractFeatureParser
 description Does the language support message passing?
 string title Message Passing
 string pseudoExample "get pldb"
 string reference https://en.wikipedia.org/wiki/Message_passing
hasMethodChainingParser
 extends abstractFeatureParser
 description Does the language support method chaining?
 string title Method Chaining
 string pseudoExample pldbFile.toString().length
 string reference https://en.wikipedia.org/wiki/Method_chaining
hasMethodOverloadingParser
 description Does the language support method overloading?
 extends abstractFeatureParser
hasMethodsParser
 extends abstractFeatureParser
 description Does the language have methods on classes?
 string title Methods
 string pseudoExample pldbFile.downloadWebsite()
 string reference https://en.wikipedia.org/wiki/Method_(computer_programming)
hasMixinsParser
 extends abstractFeatureParser
 description Does the language allow including methods from a class without inheriting from that class?
 string title Mixins
 string pseudoExample extends pldbFile, diskFile
 string reference https://en.wikipedia.org/wiki/Mixin
hasModulesParser
 extends abstractFeatureParser
 description Does the language have a concept of modules for organizing and packaging code?
 string title Module Pattern
 string pseudoExample module PLDB {}
 string reference https://en.wikipedia.org/wiki/Module_pattern
hasMonadsParser
 extends abstractFeatureParser
 description Does the language have monads?
 string title Monad
 string pseudoExample g >>= f
 string reference https://en.wikipedia.org/wiki/Monad_(functional_programming)
hasMultiLineCommentsParser
 extends abstractFeatureParser
 description Does the language have multi-line comments?
 string title MultiLine Comments
 string reference https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)#Comments
 string pseudoExample /* Hello PLDB */
 string tokenKeyword multiLineCommentTokens
hasMultilineStringsParser
 extends abstractFeatureParser
 description Does the language support multiline strings?
 string title Multiline Strings
 string pseudoExample hello = """Hello\\nPLDB"""
hasMultipleDispatchParser
 extends abstractFeatureParser
 description Does the language support multiple dispatch?
 string title Multiple Dispatch
 string pseudoExample collide_with(x::Spaceship, y::Spaceship)
 string reference https://en.wikipedia.org/wiki/Multiple_dispatch
hasMultipleInheritanceParser
 extends abstractFeatureParser
 description Does the language allow multiple inheritance?
 string title Multiple Inheritance
 string pseudoExample extends parentWhichExtendsSomethingElse
 string reference https://en.wikipedia.org/wiki/Multiple_inheritance
hasNamespacesParser
 extends abstractFeatureParser
 description Does the language have a namespace construct?
 string title Namespaces
 string pseudoExample namespace PLDB {}
hasNullParser
 extends abstractFeatureParser
 description Does the language have a null value?
 string title Null
 string reference https://en.wikipedia.org/wiki/Null_pointer
 string pseudoExample uhOh = null
hasOctalsParser
 extends abstractFeatureParser
 description Does the language have a syntax for octal numbers?
 string title Octals
 string aka Base8
 string aka oct
 string pseudoExample 0o464063622
 string reference https://en.wikipedia.org/wiki/Octal
hasOperatorOverloadingParser
 extends abstractFeatureParser
 description Does the language allow operator overloading?
 string title Operator Overloading
 string reference https://en.wikibooks.org/wiki/Introduction_to_Programming_Languages/Overloading https://en.wikipedia.org/wiki/Operator_overloading
 string pseudoExample def __add__(): doSomethingDifferent()
hasOperatorsParser
 extends abstractFeatureParser
 description Does the language have operators?
 string title Operators
 string reference https://en.wikipedia.org/wiki/Operator_(computer_programming)
 string pseudoExample 1 + 1
hasPairsParser
 extends abstractFeatureParser
 description Does the language have a pair structure?
 string title Pairs
 string pseudoExample (pl . db)
hasPartialApplicationParser
 extends abstractFeatureParser
 description Does the language support partial application?
 string title Partial Application
 string pseudoExample add5 = num => addNumbers(10, num)
 string reference https://en.wikipedia.org/wiki/Partial_application
hasPatternMatchingParser
 extends abstractFeatureParser
 description Does the language support pattern matching?
 string title Pattern Matching
 string pseudoExample fib 0 = 1; fib 1 = 1
 string reference https://en.wikipedia.org/wiki/Pattern_matching
hasPipesParser
 extends abstractFeatureParser
 description Does the language have a pipe operator?
 string title Pipes
 string pseudoExample ls pldb | wc
 string reference https://en.wikipedia.org/wiki/Pipeline_(software)
hasPointersParser
 extends abstractFeatureParser
 // question: are there languages that have pointers to a location in an l1/lN cache?
 description Does the language have a structure that is a location in memory?
 string title Pointers
 string pseudoExample int *pldb
 string reference https://en.wikipedia.org/wiki/Pointer_(computer_programming)
hasPolymorphismParser
 extends abstractFeatureParser
 description Does the language have polymorphism?
 string title Polymorphism
 string pseudoExample a + "b"; 1 + 2
 string reference https://en.wikipedia.org/wiki/Polymorphism_(computer_science)
hasPostfixNotationParser
 extends abstractFeatureParser
 description Does the language allow operators to be placed at the end of the expression?
 string title Postfix Notation
 string pseudoExample 2 3 4 + 2 -
 string reference https://en.wikipedia.org/wiki/Reverse_Polish_notation
hasPrefixNotationParser
 extends abstractFeatureParser
 description Does the language allow operators to be placed at the beginning of the expression?
 string title Prefix Notation
 string pseudoExample + 1 2
 string reference https://en.wikipedia.org/wiki/Polish_notation
hasPrintDebuggingParser
 extends abstractFeatureParser
 description Does the language have a built in function that allows one to print debug?
 string title Print() Debugging
 string reference https://en.wikipedia.org/wiki/Debug_code#Print_debugging
 string pseudoExample print "Hello PLDB"
 string tokenKeyword printToken
hasProcessorRegistersParser
 extends abstractFeatureParser
 description Does the language have named symbols for a processor's registers?
 string title Processor Registers
 string pseudoExample eax 2
 string reference https://en.wikipedia.org/wiki/Processor_register
hasRangeOperatorsParser
 extends abstractFeatureParser
 description Does the language have a syntax for creating ranges?
 string title Range Operator
 string reference https://docstore.mik.ua/orelly/perl4/prog/ch03_15.htm
 string pseudoExample 1 ... 10
hasReferencesParser
 extends abstractFeatureParser
 description Does the language have a structure for holding a reference to an existing object?
 string title References
 string pseudoExample fn(objPointer)
 string reference https://en.wikipedia.org/wiki/Reference_(computer_science)
hasRefinementTypesParser
 extends abstractFeatureParser
 description Does the language have a way to attach a predicate to a type?
 string title Refinement Types
 string pseudoExample evenInt where int % 2 = 0
 string reference https://en.wikipedia.org/wiki/Refinement_type
hasRegularExpressionsSyntaxSugarParser
 extends abstractFeatureParser
 description Does the language have special syntax for regular expressions?
 string title Regular Expression Syntax Sugar
 string reference https://pldb.com/concepts/regex.html
 string pseudoExample /pldb/
hasRequiredMainFunctionParser
 description Does the language require a function named main (or similar)?
 extends abstractFeatureParser
hasReservedWordsParser
 description Does a concept of reserved words exists, for example, not being able to use certain keywords as variable names.?
 extends abstractFeatureParser
hasRunTimeGuardsParser
 extends abstractFeatureParser
 description Does the language support run-time guards?
 string title Runtime Guards
 string pseudoExample f x | x > 0 = 1 | otherwise = 0
 string reference https://en.wikipedia.org/wiki/Guard_(computer_science)
hasSExpressionsParser
 description Does the language have S Expressions?
 extends abstractFeatureParser
 string title S-Expressions
 string pseudoExample (+ 1 1)
 string reference https://en.wikipedia.org/wiki/S-expression
hasScientificNotationParser
 extends abstractFeatureParser
 description Does the language have a syntax for Scientific Notation?
 string title Scientific Notation
 string aka E Notation
 string pseudoExample 8076686.6e1
 string reference https://en.wikipedia.org/wiki/Scientific_notation
hasSelfOrThisWordParser
 description Does a language have a keyword or syntax to refer to the current instance?
 extends abstractFeatureParser
hasSemanticIndentationParser
 extends abstractFeatureParser
 description Does the language use semantic indentation?
 string aka off-side rule
 string title Semantic Indentation
 string reference https://pldb.com/posts/which-programming-languages-use-indentation.html
 string pseudoExample line0 if true line1  print "Hello PLDB"
hasSetsParser
 extends abstractFeatureParser
 description Does the language come with a Set data structure?
 string title Sets
 string pseudoExample {"pldb", "PLDB"}
 string reference https://en.wikipedia.org/wiki/Set_(abstract_data_type)
hasSingleDispatchParser
 extends abstractFeatureParser
 description Does the method called depended on a single operand?
 string title Single Dispatch
 string reference https://en.wikipedia.org/wiki/Dynamic_dispatch#Single_and_multiple_dispatch
 string pseudoExample person.run()
hasSingleTypeArraysParser
 extends abstractFeatureParser
 description Does the language have a list data structure that only can hold items of the same type?
 string title Single-Type Arrays
 string reference https://en.wikipedia.org/wiki/Array_data_structure
 string pseudoExample const pldbRanks: int[]
hasSourceMapsParser
 extends abstractFeatureParser
 description Does the language support the generation of source maps?
 string title Source Maps
 string pseudoExample {file: 'pldb.min.js',sources: ['pldb.js'], mappings: 'CAAC,IAAI,IAAM'}
hasStatementTerminatorCharacterParser
 description Does the language have a statement terminator character such as ";"?
 extends abstractFeatureParser
hasStatementsParser
 extends abstractFeatureParser
 description Does the language have a concept of statements?
 string title Statements
 string pseudoExample print "Hello PLDB"
 string reference https://en.wikipedia.org/wiki/Statement_(computer_science)
hasStaticMethodsParser
 extends abstractFeatureParser
 description Can a class have static methods?
 string title Static Methods
 string reference https://www.geeksforgeeks.org/static-methods-vs-instance-methods-java/
 string pseudoExample static downloadPldb() {}
hasStaticTypingParser
 extends abstractFeatureParser
 description Does the language have static typing at compile time?
 string title Static Typing
 string reference https://en.wikipedia.org/wiki/Type_system#Static_type_checking
 string pseudoExample int pldbRank = 100
hasStreamsParser
 extends abstractFeatureParser
 description Does the language have a concept of streams?
 string title Streams
 string pseudoExample echo 123 | 123.txt
 string reference https://en.wikipedia.org/wiki/Stream_(computing)
hasStringConcatOperatorParser
 description Is there an operator for concatenating strings?
 extends abstractFeatureParser
hasStringsParser
 extends abstractFeatureParser
 description Does the language have a strings data structure?
 string title Strings
 string pseudoExample "Hello PLDB"
 string tokenKeyword stringToken
 string reference https://en.wikipedia.org/wiki/String_(computer_science)
hasStructsParser
 extends abstractFeatureParser
 description Does the language have a structs structure?
 string title Structs
 string pseudoExample struct pldbFile { int rank; char *title; };
 string reference https://en.wikipedia.org/wiki/Struct_(C_programming_language)
hasSwitchParser
 extends abstractFeatureParser
 description Does the language have switch statements or expressions?
 string title Switch Statements
 string pseudoExample switch animal: case dog-buy; case cat-sell;
 string reference https://en.wikipedia.org/wiki/Switch_statement
hasSymbolTablesParser
 extends abstractFeatureParser
 description Does the compiler use symbol tables internally?
 string title Symbol Tables
 string pseudoExample SymbolName|Type|Scope;bar|function,double|extern
 string reference https://en.wikipedia.org/wiki/Symbol_table
hasSymbolsParser
 description Does the language have a concept of symbols?
 extends abstractFeatureParser
hasTemplatesParser
 extends abstractFeatureParser
 description Does the language support templates?
 string title Templates
 string pseudoExample template TCopy(T) {}
 string reference https://en.wikipedia.org/wiki/Template_metaprogramming
hasTernaryOperatorsParser
 extends abstractFeatureParser
 description Does the language have ternary operators?
 string title Ternary operators
 string pseudoExample true ? 1 : 0
 string reference https://en.wikipedia.org/wiki/Ternary_operation
hasThreadsParser
 extends abstractFeatureParser
 description Does the language support a concept of threads?
 string title Threads
 string pseudoExample thread1(); thread2();
 string reference https://en.wikipedia.org/wiki/Thread_(computing)
hasTimestampsParser
 description Does the language have a builtin timestamps data structure?
 extends abstractFeatureParser
hasTraitsParser
 extends abstractFeatureParser
 description Does the language support traits?
 string title Traits
 string pseudoExample use redBorder
 string reference https://en.wikipedia.org/wiki/Trait_(computer_programming)
hasTriplesParser
 extends abstractFeatureParser
 description Does the language have a structure for subject–predicate–object expressions?
 string title Triples
 string pseudoExample Javascript isListedIn PLDB
 string reference https://en.wikipedia.org/wiki/Semantic_triple
hasTryCatchParser
 description Does the language have a try/catch construct?
 extends abstractFeatureParser
hasTypeAnnotationsParser
 extends abstractFeatureParser
 description Does the language have a syntax for annotating the types of variables?
 string title Type Annotations
 string pseudoExample score: number
hasTypeInferenceParser
 extends abstractFeatureParser
 description Can the parser infer the type of a variable at compile time without an annotation?
 string title Type Inference
 string reference https://en.wikipedia.org/wiki/Type_inference
 string pseudoExample imAString = "pldb"
hasTypeParametersParser
 extends abstractFeatureParser
 description Does the language support a concept of type parameters?
 string title Type Parameters
 string pseudoExample function identity<T>(arg: T): T {return arg}
 string reference https://en.wikipedia.org/wiki/TypeParameter
hasTypedHolesParser
 extends abstractFeatureParser
 description Does the language have a syntax for typed holes?
 string title Typed Holes
 string reference https://wiki.haskell.org/GHC/Typed_holes
 string pseudoExample 2 + _ => 2 + [int|float]
hasUnaryOperatorsParser
 extends abstractFeatureParser
 description Does the language have any unary operators like ++ or --?
 string title Unary Operators
 string pseudoExample count++
 string reference https://en.wikipedia.org/wiki/Unary_operation
hasUnicodeIdentifiersParser
 extends abstractFeatureParser
 description Does the language support Unicode identifiers?
 // some support only ASCII
 string title Unicode Identifers
 string pseudoExample δ = 0.00001
hasUnionTypesParser
 extends abstractFeatureParser
 description Does the language support union types?
 string title Union Types
 string pseudoExample any = string | number
 string reference https://en.wikipedia.org/wiki/Union_type
hasUnitsOfMeasureParser
 extends abstractFeatureParser
 description Does the language support units of measure?
 string title Units of Measure
 string pseudoExample 42cm
 string reference https://en.wikipedia.org/wiki/Unit_of_measurement
hasUserDefinedOperatorsParser
 description Does the language allow for defining your own operators?
 extends abstractFeatureParser
hasValueReturnedFunctionsParser
 description Can functions return a value?
 extends abstractFeatureParser
hasVariableSubstitutionSyntaxParser
 extends abstractFeatureParser
 description Do you use different syntax when assigning versus referencing a variable?
 string title Variable Substitution Syntax
 string pseudoExample name = "PLDB"; print $name
hasVariadicFunctionsParser
 description Does the language support functions that accept a variable number of parameters?
 extends abstractFeatureParser
 string title Variadic Functions
 string pseudoExample args.map(doSomething)
 string reference https://en.wikipedia.org/wiki/Variadic_function
hasVirtualFunctionsParser
 description Does the language have virtual functions?
 extends abstractFeatureParser
 string title Virtual function
 string pseudoExample virtual FetchPLDBFile();
 string reference https://en.wikipedia.org/wiki/Virtual_function
hasVoidFunctionsParser
 description Does the language have void functions that return nothing?
 extends abstractFeatureParser
hasWhileLoopsParser
 description Does the language have while loops?
 extends abstractFeatureParser
 string title While Loops
 string pseudoExample while (pldb.pop()) loop()
 string reference https://en.wikipedia.org/wiki/While_loop
hasZeroBasedNumberingParser
 description Does the language start counting from 0, rather than 1?
 extends abstractFeatureParser
 string title Zero-based numbering
 string reference https://en.wikipedia.org/wiki/Zero-based_numbering
 string pseudoExample firstItem = pldb[0]
hasZippersParser
 extends abstractFeatureParser
 description Does the language have zippers built in or as a library, which are roughly a pointer with context on a tree?
 string title Zippers
 string reference https://wiki.haskell.org/Zipper https://en.wikipedia.org/wiki/Zipper_(data_structure)
 string pseudoExample pldbCursor.moveLeft()
isCaseSensitiveParser
 extends abstractFeatureParser
 description Is this language case sensitive?
 string title Case Sensitivity
 string reference https://en.wikipedia.org/wiki/Case_sensitivity
 string pseudoExample pldb != PLDB
isLispParser
 extends abstractFeatureParser
 string title Lispy
 description Is this in the Lisp family of languages?
 string reference https://en.wikipedia.org/wiki/Lisp_(programming_language)
 string pseudoExample (+ 1 2)
letterFirstIdentifiersParser
 extends abstractFeatureParser
 description Must identifiers start with a letter?
 string title Letter-first Identifiers
 string pseudoExample pldb100 = "OK" // 100pldb = "ERROR"
mergesWhitespaceParser
 extends abstractFeatureParser
 description Does this language merge whitespace, so N spaces is treated the same as a single space?
 string title Merges Whitespace
 string reference http://wiki.c2.com/?SyntacticallySignificantWhitespaceConsideredHarmful
 string pseudoExample result = 1    +    2
supportsBreakpointsParser
 extends abstractFeatureParser
 description Does this language support breakpoints?
 string title Breakpoints
 string pseudoExample debugger;
 string reference https://en.wikipedia.org/wiki/Breakpoint
isLanguageParser
 boolean isComputed true
 extends abstractBooleanColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description Does PLDB categorize this entity as a language?
isOpenSourceParser
 boolean alwaysRecommended true
 description Is this an open source project?
 extends abstractBooleanColumnParser
isPublicDomainParser
 boolean alwaysRecommended true
 description Is this public domain?
 extends abstractBooleanColumnParser
gdbSupportParser
 extends abstractBooleanColumnParser
 description Is the language supported by the GNU Debugger?
 string sourceDomain sourceware.org
githubCopilotOptimizedParser
 description Is this language optimized for GitHub copilot, as found on this list https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot?
 extends abstractBooleanColumnParser
isDeadParser
 description Has the creator or maintainer announced it officially dead? Include a link to proof of the announcement.
 extends abstractBooleanColumnParser
 catchAllParser urlCitationParser
abstractParadigmParser
 cells columnNameCell boolCell
 extends abstractBooleanColumnParser
visualParadigmParser
 extends abstractParadigmParser
 description Is this a visual programming thing? Sometimes called "no code" or "low code"?
usesSemanticVersioningParser
 extends abstractBooleanColumnParser
 description Does the official release of the language use semantic versioning?
abstractOneWordGuidColumnParser
 string typeForCsvDocs guid
 cells columnNameCell externalGuidCell
 extends abstractTrueBaseColumnParser
 description Use when you have a column that serves as a Globally Unique Identifier (GUID) where the GUID does not contain spaces.
codeMirrorParser
 extends abstractOneWordGuidColumnParser
 description What is a URL to a CodeMirror syntax highlighting package for this language?
 // Many can be found here: https://github.com/codemirror/codemirror5/tree/master/mode/LANGUAGE
 string sourceDomain codemirror.net
monacoParser
 extends abstractOneWordGuidColumnParser
 description What is a URL to a Monaco syntax highlighting package for this language?
 example
  javascript
   monaco javascript
 string sourceDomain microsoft.github.io/monaco-editor/
tryItOnlineParser
 extends abstractOneWordGuidColumnParser
 description What is a link to try this language on https://tio.run?
 string sourceDomain tio.run
ubuntuPackageParser
 extends abstractOneWordGuidColumnParser
 description What is the name of an Ubuntu package for this language from https://packages.ubuntu.com/, if any?
 string sourceDomain ubuntu.com
abstractMultiwordGuidColumnParser
 string typeForCsvDocs guid
 description Use when you have a column that serves as a Globally Unique Identifier (GUID) where the GUID can contain spaces.
 catchAllCellType externalGuidCell
 extends abstractTrueBaseColumnParser
compilerExplorerParser
 extends abstractMultiwordGuidColumnParser
 description What is this language's name on https://godbolt.org?
 string sourceDomain godbolt.org
 contentKey id
 inScope exampleParser
githubBigQueryParser
 description What is the name of this language in the Google BigQuery Public Datasets about GitHub repos found at https://cloud.google.com/blog/topics/public-datasets/github-on-bigquery-analyze-all-the-open-source-code?
 extends abstractMultiwordGuidColumnParser
 contentKey id
 string sourceDomain cloud.google.com
 usersParser
  description How many unique users have a repo using this language according to Google BigQuery?
  extends abstractPopulationCountColumnParser
 reposParser
  description How many repos for this language are listed in Google's BigQuery Public GitHub Dataset snapshot?
  extends abstractCountColumnParser
githubLanguageParser
 description What is the name of this language on GitHub's list of supported languages defined here https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml?
 extends abstractMultiwordGuidColumnParser
 inScope filenamesParser fileExtensionsParser
 contentKey id
 string sourceDomain github.com
 reposParser
  boolean fromCrawler true
  extends abstractCountColumnParser
  description How many repos for this language does GitHub report?
 wrapParser
  extends abstractBooleanColumnParser
  description Does GitHub override it's default of not wrapping lines when displaying this language?
 trendingProjectsCountParser
  boolean fromCrawler true
  extends abstractCountColumnParser
  description How many trending repos for this language does GitHub report?
 trendingProjectsParser
  // todo Figure out typings.
  extends abstractDelimitedValuesBlobColumnParser
  boolean fromCrawler true
  description What are trending projects in this language GitHub?
  example
   author name avatar url language languageColor stars forks currentPeriodStars description
   PavelDoGreat WebGL-Fluid-Simulation https://github.com/PavelDoGreat.png https://github.com/PavelDoGreat/WebGL-Fluid-Simulation JavaScript #f1e05a 6010 473 2246 "Play with fluids in your browser (works even on mobile)"
 groupParser
  extends abstractMultiwordGuidColumnParser
  description What is the name of the parent language group according to GitHub?
 aliasesParser
  extends abstractStringListColumnParser
  description What are additional aliases, excluding name.downcase which are implicitly included?
  listDelimiter  or 
 interpretersParser
  extends abstractStringListColumnParser
  description What are the associated interpreters?
 aceModeParser
  extends abstractWordColumnParser
  description What is the name of the Ace Mode used for highlighting whenever a file is edited, matching one of the filenames in http://git.io/3XO_Cg, or "text" for everything else?
 codemirrorModeParser
  extends abstractWordColumnParser
  description What is the name name of the CodeMirror Mode used for highlighting whenever a file is edited, from the list here https://git.io/vi9Fx?
 codemirrorMimeTypeParser
  extends abstractWordColumnParser
  description What is the name of the file mime type used for highlighting whenever a file is edited, from the list here https://git.io/f4SoQ?
 tmScopeParser
  extends abstractMultiwordGuidColumnParser
  description What is the TextMate scope that represents this programming language, matching one of the scopes listed in the grammars.yml file, or "none" if there is no grammar for this language?
 typeParser
  extends abstractEnumColumnParser
  description Which of the types best describes this: data, programming, markup, prose, or nil?
leachim6Parser
 extends abstractMultiwordGuidColumnParser
 description What is a URL to this language in leachim6's hello-world project?
 string sourceDomain github.com/leachim6/hello-world
 contentKey id
 inScope fileExtensionsParser exampleParser
 filepathParser
  description What is the filepath to this language in leachim6's hello-world project?
  extends abstractStringColumnParser
projectEulerParser
 extends abstractMultiwordGuidColumnParser
 description Is this language one of the ones listed on https://projecteuler.net/?
 string sourceDomain projecteuler.net
 contentKey id
 memberCountParser
  description How many project euler members use this language?
  extends abstractAnnualPopulationCountMapParser
pygmentsHighlighterParser
 extends abstractMultiwordGuidColumnParser
 description What is a url to a Pygments syntax highlighting class for this language https://pygments.org/?
 string sourceDomain pygments.org
 inScope fileExtensionsParser
 contentKey id
 filenameParser
  description What is the Python filename implementing the highlighting for this language?
  extends abstractTrueBaseColumnParser
  cells columnNameCell fileNameCell
pyplParser
 extends abstractMultiwordGuidColumnParser
 description What is this language's id on https://pypl.github.io?
 string sourceDomain pypl.github.io
quineRelayParser
 extends abstractMultiwordGuidColumnParser
 description What is the name of this language in the Quine Relay project from here https://github.com/mame/quine-relay?
 string sourceDomain github.com/mame/quine-relay
tiobeParser
 extends abstractMultiwordGuidColumnParser
 description What is the ID of this language in Tiobe's ranking of programming languages here: https://www.tiobe.com/tiobe-index/?
 string sourceDomain tiobe.com
 contentKey id
 currentRankParser
  description What is the current Tiobe rank of this language?
  extends abstractIntColumnParser
abstractStringColumnParser
 string typeForCsvDocs string
 catchAllCellType stringCell
 extends abstractTrueBaseColumnParser
idParser
 description What is the name of this file without the extension?
 extends abstractStringColumnParser
 boolean isComputed true
 boolean suggestInAutocomplete false
getSourceParser
 boolean isComputed true
 extends abstractStringColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is a one line shell command to download the source code for this language?
descriptionParser
 boolean alwaysRecommended true
 extends abstractStringColumnParser
 description What is a short description of this language?
abstractStringListColumnParser
 string typeForCsvDocs string[]
 description A list of strings separated by the \`listDelimiter\`. The default \`listDelimiter\` is space.
 extends abstractStringColumnParser
 listDelimiter  
keywordsParser
 description What are all the keywords in this language?
 extends abstractStringListColumnParser
 catchAllCellType tokenCell
abstractCommonTokenParser
 description Most general purpose programming languages implement a set of common tokens for common features like these.
 catchAllCellType tokenCell
 extends abstractStringListColumnParser
 single false
lineCommentTokenParser
 extends abstractCommonTokenParser
 description What is the token(s) that can be placed anywhere on a line and starts a comment that cannot be stopped except by a line break character or end of file?
 example
  javascript
   lineCommentToken //
multiLineCommentTokensParser
 extends abstractCommonTokenParser
 description What is the start delimiter and end token (which can be the same) for comments that can span multiple lines?
 example
  javascript
   multiLineCommentTokens /* */
printTokenParser
 extends abstractCommonTokenParser
 description What token(s) is used to print a message?
 example
  javascript
   printToken console.log
stringTokenParser
 extends abstractCommonTokenParser
 description What token(s) is used to delimit a string?
 example
  javascript
   stringToken "
assignmentTokenParser
 extends abstractCommonTokenParser
 description What token(s) is used for assignment to an identifier?
 example
  javascript
   assignmentToken =
booleanTokensParser
 extends abstractCommonTokenParser
 description What token(s) is used for true and false?
 example
  javascript
   booleanTokens true false
includeTokenParser
 extends abstractCommonTokenParser
 description What token(s) is used for including another file?
 example
  nodejs
   includeToken require
fileExtensionsParser
 extends abstractStringListColumnParser
 catchAllCellType fileExtensionCell
 description What are the file extensions for this language?
filenamesParser
 extends abstractStringListColumnParser
 catchAllCellType fileNameCell
 description What are the filenames commonly associated with this language?
creatorsParser
 extends abstractStringListColumnParser
 boolean alwaysRecommended true
 description What are the name(s) of the original creators of the language delimited by " and "?
 catchAllCellType creatorNameCell
 listDelimiter  and 
originCommunityParser
 description In what community(ies) did the language first originate?
 boolean alwaysRecommended true
 // todo Make origin community name the url for the community? instead of the name? Not sure.
 listDelimiter  && 
 example
  originCommunity Microsoft && /r/programminglanguages && news.ycombinator.com
 extends abstractStringListColumnParser
abstractTrueBaseLinksColumnParser
 description Links to other files in the TrueBase.
 catchAllCellType trueBaseIdCell
 string typeForCsvDocs trueBaseId[]
 extends abstractStringListColumnParser
 javascript
  get trueBaseIds() {
   return this.getWordsFrom(1)
  }
  updateTruebaseIds(oldTrueBaseId, newTrueBaseId) {
   this.setContent(
    this.getWordsFrom(1)
     .map((word) => (word === oldTrueBaseId ? newTrueBaseId : word))
     .join(" ")
   )
  }
forLanguagesParser
 description Which languages is this repository for?
 extends abstractTrueBaseLinksColumnParser
abstractRelationshipParser
 extends abstractTrueBaseLinksColumnParser
 // todo: remove need for sortKey in Grammar
 string sortKey abstractRelationshipParser
relatedParser
 extends abstractRelationshipParser
 description What languages are related?
 // This serves as a catch all, and it is better to use a more specific relationship node such as "supersetOf".
runsOnVmParser
 extends abstractRelationshipParser
 description What virtual machine(s) does this language run on? 
influencedByParser
 description What languages influenced this one?
 extends abstractRelationshipParser
successorOfParser
 description Was this language launched as the successor of another?
 extends abstractRelationshipParser
subsetOfParser
 description Is this language a subset of another?
 extends abstractRelationshipParser
implementationOfParser
 description Is this language an implementation of another?
 extends abstractRelationshipParser
renamedToParser
 description What is the new name of this language?
 extends abstractRelationshipParser
supersetOfParser
 description Is this language a superset of another?
 // If you specify this link then the superset language will inherit all features of subset language.
 extends abstractRelationshipParser
writtenInParser
 description What language(s) is the main implementation written in?
 extends abstractRelationshipParser
extensionOfParser
 description What language is this language an extension of?
 extends abstractRelationshipParser
forkOfParser
 description What language is this language a fork of?
 extends abstractRelationshipParser
compilesToParser
 description Which language(s) does this language primarily compile to?
 extends abstractRelationshipParser
inputLanguagesParser
 description Which language(s) does this take as input? For compilers, what languages does this compile compile?
 extends abstractRelationshipParser
titleParser
 description What is the official title of the language?
 extends abstractStringColumnParser
 required
standsForParser
 description If the language name is an acronym what does/did it stand for?
 extends abstractStringColumnParser
akaParser
 description What is this also known as?
 extends abstractStringColumnParser
 single false
oldNameParser
 description What is the old name of this language?
 extends abstractStringColumnParser
abstractNumericColumnParser
 string typeForCsvDocs number
 extends abstractTrueBaseColumnParser
abstractIntColumnParser
 string typeForCsvDocs integer
 cells columnNameCell intCell
 extends abstractNumericColumnParser
hoplIdParser
 boolean isComputed true
 extends abstractIntColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is the HOPL id of this language?
abstractComputedSumColumnParser
 boolean isComputed true
 boolean suggestInAutocomplete false
 extends abstractIntColumnParser
bookCountParser
 extends abstractComputedSumColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is the count of booked we have published about this thing?
paperCountParser
 extends abstractComputedSumColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is the count of papers we have published about this thing?
exampleCountParser
 extends abstractComputedSumColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description How many examples do we have written in this language?
factCountParser
 extends abstractComputedSumColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description How many answers do we have about this thing?
abstractCountColumnParser
 description A positive count of something. People, for example. Min is 0.
 cells columnNameCell countCell
 extends abstractIntColumnParser
abstractComputedEstimateColumnParser
 boolean isComputed true
 boolean suggestInAutocomplete false
 extends abstractCountColumnParser
numberOfUsersEstimateParser
 extends abstractComputedEstimateColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is our estimate of number of users of this language?
numberOfJobsEstimateParser
 extends abstractComputedEstimateColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description What is our estimate of the number of jobs in this language?
centralPackageRepositoryCountParser
 extends abstractCountColumnParser
 description How many central package repositories does this language have?
packageInstallCountParser
 description How many packages have been downloaded?
 extends abstractCountColumnParser
packageCountParser
 description How many packages are in the repository?
 // A package is some code with a name and a namespace, shipped as an atomic unit, with an owner(s).
 extends abstractCountColumnParser
abstractPopulationCountColumnParser
 extends abstractCountColumnParser
packageAuthorsParser
 extends abstractPopulationCountColumnParser
 description How many people contribute packages to this cpm?
abstractComputedRankColumnParser
 boolean isComputed true
 boolean suggestInAutocomplete false
 extends abstractIntColumnParser
rankParser
 extends abstractComputedRankColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description How does this thing rank amongst all entities in this TrueBase?
languageRankParser
 extends abstractComputedRankColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 description How does this language rank amongst all languages in PLDB?
abstractYearColumnParser
 cells columnNameCell yearCell
 extends abstractIntColumnParser
lastActivityParser
 extends abstractYearColumnParser
 // todo: bug the below line should be included via inheritance from WWC.
 boolean suggestInAutocomplete false
 boolean isComputed true
 description In our data on this entity, what year is the most recent activity?
appearedParser
 description What year was the language publicly released and/or announced?
 extends abstractYearColumnParser
 required
wordRankParser
 description Where does this word rank in terms of common English words?
 // where "the" is 1.
 extends abstractIntColumnParser
abstractFloatColumnParser
 cells columnNameCell floatCell
 extends abstractNumericColumnParser
abstractPercentageColumnParser
 cells columnNameCell percentCell
 extends abstractNumericColumnParser
countryParser
 uniqueLine
 description What country was this language first developed in?
 boolean alwaysRecommended true
 catchAllCellType countryNameCell
 extends abstractTrueBaseColumnParser
 single false
dblpParser
 boolean fromCrawler true
 extends abstractTrueBaseColumnParser
 description What are publications about this language from https://dblp.org/?
 string sourceDomain dblp.org
 hitsParser
  extends abstractCountColumnParser
  description How many matching publications?
 publicationsParser
  extends abstractDelimitedValuesBlobColumnParser
  description An inline PSV table of hits.
abstractStringBlobColumnParser
 string typeForCsvDocs multilineString
 extends abstractTrueBaseColumnParser
 baseParser blobParser
 javascript
  get columnValue() {
   return this.childrenToString()
  }
abstractCodeColumnParser
 extends abstractStringBlobColumnParser
 baseParser blobParser
equationParser
 description What is a LaTeX encoding of this equation?
 extends abstractCodeColumnParser
exampleParser
 description What is a representative snippet for this language?
 extends abstractCodeColumnParser
 single false
helloWorldCollectionParser
 description What is the name of this project in the Hello World Collection?
 extends exampleParser
 cruxFromId
 cells columnNameCell
 catchAllCellType helloWorldCollectionIdCell
 string sourceDomain helloworldcollection.de
funFactParser
 cells columnNameCell urlCell
 description What is a code block or some text containing a fun or unusual fact about the language?
 extends abstractCodeColumnParser
abstractDelimitedValuesBlobColumnParser
 description A CSV, TSV, or other delimited blob of text.
 // todo: figure out how we want to dump these in CSV export.
 extends abstractStringBlobColumnParser
goodreadsParser
 boolean fromCrawler true
 extends abstractDelimitedValuesBlobColumnParser
 description What are books about this language from Goodreads?
 string sourceDomain goodreads.com
hackerNewsDiscussionsParser
 boolean fromCrawler true
 extends abstractDelimitedValuesBlobColumnParser
 description What are URLS to Hacker News posts discussing this language?
 string sourceDomain news.ycombinator.com
isbndbParser
 boolean fromCrawler true
 extends abstractDelimitedValuesBlobColumnParser
 description What are books about this language from ISBNdb?
 string sourceDomain isbndb.com
semanticScholarParser
 boolean fromCrawler true
 extends abstractDelimitedValuesBlobColumnParser
 description What are papers about this language from Semantic Scholar?
 string sourceDomain semanticscholar.org
abstractEnumColumnParser
 string typeForCsvDocs enum
 cells columnNameCell enumCell
 extends abstractTrueBaseColumnParser
fileTypeParser
 description What is the file encoding for programs in this language?
 cells columnNameCell fileTypeWordCell
 extends abstractEnumColumnParser
nativeLanguageParser
 cells columnNameCell nativeLanguageWordCell
 description What is the native human language for this language, if not English?
 extends abstractEnumColumnParser
announcementMethodParser
 description How was the language first announced?
 extends abstractEnumColumnParser
 cells columnNameCell announcementMethodCell
typeParser
 description Which category in PLDB's subjective ontology does this entity fit into?
 cells columnNameCell typeCell
 required
 extends abstractEnumColumnParser
abstractHashMapColumnParser
 string typeForCsvDocs multilineStringMap
 extends abstractTrueBaseColumnParser
 javascript
  get columnValue() {
   return this.childrenToString()
  }
abstractAnnualPopulationCountMapParser
 catchAllParser annualPopulationCountParser
 description A map of counts, one per year.
 extends abstractHashMapColumnParser
indeedJobsParser
 description How many job descriptions match this query for this language on indeed.com?
 catchAllCellType stringCell
 extends abstractAnnualPopulationCountMapParser
 contentKey query
 string sourceDomain indeed.com
linkedInSkillParser
 description How many people list this skill on LinkedIn?
 extends abstractAnnualPopulationCountMapParser
 catchAllCellType stringCell
 contentKey id
 string sourceDomain linkedin.com
abstractAnnualRankMapParser
 catchAllParser annualRankParser
 description A map of ranks, one per year.
 extends abstractHashMapColumnParser
repoStatsParser
 description What is the URL of the official GitHub repo for the project if it is hosted there?
 extends abstractHashMapColumnParser
 inScope descriptionParser
 firstCommitParser
  extends abstractYearColumnParser
  description What year the first commit made in this git repo?
 commitsParser
  extends abstractCountColumnParser
  description How many commits to the repo?
 committersParser
  extends abstractCountColumnParser
  description How many committers to the repo?
 filesParser
  extends abstractCountColumnParser
  description How many files in the repo?
stackOverflowSurveyParser
 extends abstractHashMapColumnParser
 description What is the summary of this language from the StackOverflow annual developer survey found here https://insights.stackoverflow.com/survey?
 string sourceDomain insights.stackoverflow.com
 stackOverflowSurveyYearParser
  description What are the survey results for a particular year?
  cells yearCell
  pattern \\d+
  uniqueFirstWord
  usersParser
   extends abstractPopulationCountColumnParser
   description How many developers reported using this language?
  medianSalaryParser
   description What is the median salary reported by developers using this language?
   extends abstractIntColumnParser
  fansParser
   description How many developers reported wanting to learn this language?
   extends abstractPopulationCountColumnParser
  percentageUsingParser
   description What percentage of survey respondents report using this language?
   // todo add a percentage column type that extends from float
   extends abstractFloatColumnParser
versionsParser
 description What are the release years and versions of this language?
 extends abstractHashMapColumnParser
 catchAllParser versionParser
abstractWordColumnParser
 description A single word.
 cells columnNameCell wordCell
 string typeForCsvDocs word
 extends abstractTrueBaseColumnParser
domainNameParser
 description What is the domain for this language's website if it has its own?
 cells columnNameCell domainNameCell
 extends abstractWordColumnParser
 contentKey name
 registeredParser
  extends abstractYearColumnParser
  description When was this domain first registered?
 awisRankParser
  extends abstractAnnualRankMapParser
  description What is the Alexa Web Information Service (AWIS) domain ranking?
  string sourceDomain aws.amazon.com
featureExampleCodeParser
 description What is an example that demonstrates usage of this feature?
 // Ideally includes any necessary boilerplate to be runnable.
 baseParser blobParser
annualRankParser
 cells yearCell rankCell
 uniqueFirstWord
pldbParser
 root
 description A truebase about programming languages and related concepts.
 catchAllParser trueBaseErrorParser
 // todo Should not have to manually list each node type here, but should be able to mark some tag as inscope. Should be fixed upstream in Jtree.
 inScope blankLineParser abstractTrueBaseColumnParser
 cells fileNameCell
 string fileExtension pldb
 example
  title TunaScript
  type pl
  appeared 2017
  creators Sam Lam
  example
   Hello world
 sortTemplate title appeared type isDead isPublicDomain screenshot photo demoVideo creators description website webRepl documentation devDocumentation ebook emailList spec reference cheatSheetUrl standsFor oldName renamedTo aka fileExtensions country nativeLanguage originCommunity domainName equation firstAnnouncement announcementMethod usesSemanticVersioning releaseNotesUrl proposals roadmap versions  abstractRelationshipParser  visualParadigm  abstractFeatureParser  lineCommentToken multiLineCommentTokens printToken assignmentToken stringToken booleanTokens includeToken keywords  example  gource abstractGitRepoUrlColumnParser  repoStats  funFact  wikipedia  githubLanguage githubBigQuery  antlr monaco codeMirror pygmentsHighlighter linguistGrammarRepo languageServerProtocolProject  projectEuler helloWorldCollection leachim6 rosettaCode quineRelay  compilerExplorer rijuRepl replit tryItOnline  indeedJobs linkedInSkill stackOverflowSurvey annualReportsUrl officialBlogUrl eventsPageUrl faqPageUrl downloadPageUrl  abstractChatUrlColumnParser subreddit meetup conference  hackerNewsDiscussions redditDiscussion  tiobe hopl esolang pypl  packageRepository packageCount packageAuthors packageInstallCount forLanguages  twitter ubuntuPackage gdbSupport jupyterKernel fileType wordRank isOpenSource githubCopilotOptimized centralPackageRepositoryCount  goodreads  isbndb  semanticScholar 
versionParser
 description What is the version and release year?
 // perhaps in the future we could get more specific to month. Maybe even include what new features were added.
 cells yearCell versionCell
blankLineParser
 description Blank lines are okay.
 cells blankCell
 compiler
  stringTemplate 
 pattern ^$
 tags doNotSynthesize
 boolean shouldSerialize false
trueBaseErrorParser
 baseParser errorParser
urlCitationParser
 description Can serve as a catch all for linking to a source for columns.
 cells urlCell
annualPopulationCountParser
 cells yearCell populationCountCell
 uniqueFirstWord`)
        get handGrammarProgram() {
          return this.constructor.cachedHandGrammarProgramRoot
      }
static rootParser = pldbParser
    }

class versionParser extends GrammarBackedNode {
      get yearCell() {
      return parseFloat(this.getWord(0))
    }
get versionCell() {
      return this.getWord(1)
    }
    }

class blankLineParser extends GrammarBackedNode {
      get blankCell() {
      return this.getWord(0)
    }
get shouldSerialize() { return false }
    }

class trueBaseErrorParser extends GrammarBackedNode {
      getErrors() { return this._getErrorParserErrors() }
    }

class urlCitationParser extends GrammarBackedNode {
      get urlCell() {
      return this.getWord(0)
    }
    }

class annualPopulationCountParser extends GrammarBackedNode {
      get yearCell() {
      return parseFloat(this.getWord(0))
    }
get populationCountCell() {
      return parseFloat(this.getWord(1))
    }
    }

window.pldbParser = pldbParser
}