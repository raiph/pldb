const lodash = require("lodash")
const path = require("path")
const { TreeNode } = require("jtree/products/TreeNode.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { Utils } = require("jtree/products/Utils.js")
const { shiftRight, removeReturnChars } = Utils
const ParserFile = new TreeNode(Disk.read(path.join(__dirname, "measures", "pldbMeasures.scroll")))
const listsFolder = path.join(__dirname, "lists")
const pagesDir = path.join(__dirname, "pages")
const numeral = require("numeral")
const dayjs = require("dayjs")

const currentYear = new Date().getFullYear()
const cleanAndRightShift = str => Utils.shiftRight(Utils.removeReturnChars(str), 1)

const linkManyAftertext = links =>
  links.map((link, index) => `${index + 1}.`).join(" ") + // notice the dot is part of the link. a hack to make it more unique for aftertext matching.
  links.map((link, index) => `\n ${link} ${index + 1}.`).join("")

const makePrettyUrlLink = url => `<a href="${url}">${new URL(url).hostname}</a>`

const delimiter = `|_$^`
const quickTree = (rows, header) => `table ${delimiter}
 ${new TreeNode(rows).toDelimited(delimiter, header, false).replace(/\n/g, "\n ")}`

// todo: move to grammar
const isLanguage = type => {
  const nonLanguages = {
    vm: true,
    linter: true,
    library: true,
    webApi: true,
    characterEncoding: true,
    cloud: true,
    editor: true,
    filesystem: true,
    feature: true,
    packageManager: true,
    os: true,
    application: true,
    framework: true,
    standard: true,
    hashFunction: true,
    compiler: true,
    decompiler: true,
    binaryExecutable: true,
    binaryDataFormat: true,
    equation: true,
    interpreter: true,
    computingMachine: true,
    dataStructure: true
  }

  return nonLanguages[type] ? false : true
}

// Todo: move to Grammar with an enum concept?
const typeNames = new TreeNode(`application
assembly assembly language
binaryDataFormat
binaryExecutable binary executable format
bytecode bytecode format
characterEncoding
cloud cloud service
compiler
editor
esolang esoteric programming language
filesystem
framework
grammarLanguage
idl interface design language
interpreter
ir intermediate representation language
isa instruction set architecture
jsonFormat
library
linter
metalanguage
notation
os operating system
packageManager
feature language feature
pl programming language
plzoo minilanguage
protocol
queryLanguage
schema
standard
stylesheetLanguage
template template language
textData text data format
textMarkup text markup language
visual visual programming language
vm virtual machine
webApi
xmlFormat`).toObject()

class ConceptPage {
  constructor(name, parsed, computer) {
    const absolutePath = path.join(__dirname, "concepts", name + ".scroll")
    this.absolutePath = absolutePath
    this.computer = computer
    this.parsed = parsed
    this.node = new TreeNode(Disk.read(absolutePath))
    this.quickCache = {}
  }

  get(word) {
    return this.node.get(word)
  }

  getNode(word) {
    return this.node.getNode(word)
  }

  get filePath() {
    return this._getFilePath()
  }

  get filename() {
    return path.basename(this.absolutePath)
  }

  get permalink() {
    return this.filename.replace(".scroll", ".html")
  }

  get domainName() {
    return this.get("domainName")
  }

  get subredditId() {
    return this.get("subreddit")?.split("/").pop()
  }

  get getSource() {
    const { repo } = this
    return repo ? `git clone ${repo}` : ""
  }

  get bookCount() {
    if (this.quickCache.bookCount !== undefined) return this.quickCache.bookCount
    const gr = this.getNode(`goodreads`)?.length
    const isbndb = this.getNode(`isbndb`)?.length
    let count = 0
    if (gr) count += gr - 1
    if (isbndb) count += isbndb - 1
    this.quickCache.bookCount = count
    return count
  }

  get paperCount() {
    if (this.quickCache.paperCount !== undefined) return this.quickCache.paperCount
    const ss = this.getNode(`semanticScholar`)?.length

    let count = 0
    if (ss) count += ss - 1
    this.quickCache.paperCount = count
    return count
  }

  get hoplId() {
    return this.get("hopl")?.replace("https://hopl.info/showlanguage.prx?exp=", "")
  }

  get helpfulResearchLinks() {
    const id = this.id
    const title = this.get("title")
    const references = this.node
      .findNodes("reference")
      .map(node => "Reference: " + node.content)
      .join("\n")
    const links = ["website", "githubRepo", "wikipedia"]
      .filter(key => this.has(key))
      .map(key => `${Utils.capitalizeFirstLetter(key)}: ${this.get(key)}`)
      .join("\n")
    const searchEngines = `Google: https://www.google.com/search?q=${title}+programming+language
Google w/time: https://www.google.com/search?q=${title}+programming+language&tbs=cdr%3A1%2Ccd_min%3A1%2F1%2F1980%2Ccd_max%3A12%2F31%2F1995&tbm=
Google Scholar: https://scholar.google.com/scholar?q=${title}
Google Groups: https://groups.google.com/forum/#!search/${title}
Google Trends: https://trends.google.com/trends/explore?date=all&q=${title}
DDG: https://duckduckgo.com/?q=${title}
Wayback Machine: https://web.archive.org/web/20220000000000*/${title}`

    return (
      `<br><h3>Links for researching ${title}</h3>` +
      (links + references + "\n" + searchEngines)
        .split("\n")
        .map(line => {
          const parts = line.split(": ")
          return `<a href="${parts[1]}">${parts[0]}</a>`
        })
        .join("<br>")
    )
  }

  get names() {
    return [
      this.id,
      this.title,
      this.get("standsFor"),
      this.get("githubLanguage"),
      this.wikipediaTitle,
      ...this.getAll("aka")
    ].filter(i => i)
  }

  get fileExtension() {
    return this.extensions.split(" ")[0]
  }

  get keywords() {
    const kw = this.get("keywords")
    return kw ? kw.split(" ") : []
  }

  get repo() {
    return this.node.getOneOf("gitRepo githubRepo gitlabRepo sourcehutRepo".split(" "))
  }

  get repl() {
    return this.node.getOneOf("webRepl rijuRepl tryItOnline replit".split(" "))
  }

  get lineCommentToken() {
    return this.get("lineCommentToken")
  }

  get langRankDebug() {
    // todo
    return ""
    const obj = this.parent.getLanguageRankExplanation(this)
    return `TotalRank: ${obj.totalRank} Jobs: ${obj.jobsRank} Users: ${obj.usersRank} Facts: ${obj.factsRank} Links: ${obj.pageRankLinksRank}`
  }

  get previousRanked() {
    return this.isLanguage
      ? this.computer.getFileAtLanguageRank(this.languageRank - 1)
      : this.computer.getFileAtRank(this.rank - 1)
  }

  get nextRanked() {
    return this.isLanguage
      ? this.computer.getFileAtLanguageRank(this.languageRank + 1)
      : this.computer.getFileAtRank(this.rank + 1)
  }

  get exampleCount() {
    return this.allExamples.length + this.featuresWithExamples.length
  }

  // Todo: make this a general Scroll feature
  // Support inheritance in the dataset. Entities can extend from other entities and override
  // only the column values where they are different.
  get extended() {
    return this.node // todo
    if (this.quickCache.extended) return this.quickCache.extended
    const extendedFile = this.getRelationshipFile("supersetOf") || this.getRelationshipFile("implementationOf")
    this.quickCache.extended = extendedFile ? extendedFile.patch(this) : this
    return this.quickCache.extended
  }

  get features() {
    const featuresMap = this.computer.featuresMap
    return this.extended.filter(node => featuresMap.has(node.getWord(0)))
  }

  get featuresWithExamples() {
    return this.features.filter(node => node.length)
  }

  get originCommunity() {
    const originCommunity = this.get("originCommunity")
    return originCommunity ? originCommunity.split(" && ") : []
  }

  get creators() {
    return this.get("creators")?.split(" and ") ?? []
  }

  get hasBooleansPrediction() {
    const { keywords } = this

    const pairs = ["true false", "TRUE FALSE", "True False"]

    let hit
    pairs.forEach(pair => {
      const parts = pair.split(" ")
      if (keywords.includes(parts[0]) && keywords.includes(parts[1]))
        hit = {
          value: true,
          token: pair
        }
    })

    if (hit) return hit

    const examples = this.allExamples.map(code => code.code)
    pairs.forEach(pair => {
      const parts = pair.split(" ")

      const hasTrue = examples.some(code => code.includes(parts[0]))
      const hasFalse = examples.some(code => code.includes(parts[1]))

      if (hasTrue && hasFalse)
        hit = {
          value: true,
          token: pair
        }
    })

    return hit
  }

  get hasImportsPrediction() {
    const { keywords } = this

    const words = ["import", "include", "require"]

    for (let word of words) {
      if (keywords.includes(word)) {
        const example = this.allExamples.find(code => code.code.includes(word))

        if (example) {
          const exampleLine = example.code.split("\n").filter(line => line.includes(word))[0]
          return {
            value: true,
            token: word,
            example: exampleLine
          }
        } else {
          console.log(`No example found for ${this.id}`)
        }
      }
    }
  }

  makeSimpleKeywordPrediction(theWord) {
    const { keywords } = this

    if (keywords.includes(theWord))
      return {
        value: true
      }
  }

  get hasWhileLoopsPrediction() {
    return this.makeSimpleKeywordPrediction("while")
  }

  get hasClassesPrediction() {
    return this.makeSimpleKeywordPrediction("class")
  }

  get hasConstantsPrediction() {
    return this.makeSimpleKeywordPrediction("const")
  }

  get hasExceptionsPrediction() {
    return this.makeSimpleKeywordPrediction("throw")
  }

  get hasSwitchPrediction() {
    return this.makeSimpleKeywordPrediction("switch")
  }

  get hasAccessModifiersPrediction() {
    return this.makeSimpleKeywordPrediction("public")
  }

  get hasInheritancePrediction() {
    return this.makeSimpleKeywordPrediction("extends")
  }

  get hasAsyncAwaitPrediction() {
    return this.makeSimpleKeywordPrediction("async")
  }

  get hasConditionalsPrediction() {
    return this.makeSimpleKeywordPrediction("if")
  }

  get hasFunctionsPrediction() {
    return (
      this.makeSimpleKeywordPrediction("function") ||
      this.makeSimpleKeywordPrediction("fun") ||
      this.makeSimpleKeywordPrediction("def")
    )
  }

  get allExamples() {
    const examples = []

    this.node.findNodes("example").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "the web",
        link: ""
      })
    })

    this.node.findNodes("compilerExplorer example").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "Compiler Explorer",
        link: `https://godbolt.org/`
      })
    })

    this.node.findNodes("rijuRepl example").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "Riju",
        link: this.get("rijuRepl")
      })
    })

    this.node.findNodes("leachim6").forEach(node => {
      examples.push({
        code: node.getNode("example").childrenToString(),
        source: "hello-world",
        link: `https://github.com/leachim6/hello-world/blob/main/` + node.get("filepath")
      })
    })

    this.node.findNodes("helloWorldCollection").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "the Hello World Collection",
        link: `http://helloworldcollection.de/#` + node.getWord(1)
      })
    })

    const linguist_url = this.get("linguistGrammarRepo")
    this.node.findNodes("linguistGrammarRepo example").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "Linguist",
        link: linguist_url
      })
    })

    this.node.findNodes("wikipedia example").forEach(node => {
      examples.push({
        code: node.childrenToString(),
        source: "Wikipedia",
        link: this.get("wikipedia")
      })
    })

    return examples
  }

  getMostRecentInt(pathToSet) {
    let set = this.getNode(pathToSet)
    if (!set) return 0
    set = set.toObject()
    const key = Math.max(...Object.keys(set).map(year => parseInt(year)))
    return parseInt(set[key])
  }

  get appeared() {
    const appeared = this.get("appeared")
    return appeared === undefined ? 0 : parseInt(appeared)
  }

  get website() {
    return this.get("website")
  }

  get type() {
    return this.get("type").split(" ")[0]
  }

  get isLanguage() {
    // todo: add a "computerLanguage" enum type, then just search types for that string.
    return isLanguage(this.get("type"))
  }

  get otherReferences() {
    return this.node.findNodes("reference").map(line => line.content)
  }

  get wikipediaTitle() {
    const wp = this.get("wikipedia")
    return wp ? wp.replace("https://en.wikipedia.org/wiki/", "").trim() : ""
  }

  get numberOfUsersEstimate() {
    return this.parsed.numberOfUsers
  }

  get numberOfJobsEstimate() {
    return this.parsed.numberOfJobs
  }

  get percentile() {
    return this.parent.predictPercentile(this)
  }

  getRelationshipFile(relationshipType) {
    const hit = this.get(relationshipType)
    return hit ? this.computer.getConceptPage(hit) : undefined
  }

  get languageRank() {
    return this.parsed.languageRank
  }

  get rank() {
    return this.parsed.rank
  }

  link(baseFolder = "") {
    return `<a href="${baseFolder + this.permalink}">${this.title}</a>`
  }

  get extensions() {
    return getJoined(this, [
      "fileExtensions",
      "githubLanguage fileExtensions",
      "pygmentsHighlighter fileExtensions",
      "wikipedia fileExtensions"
    ])
  }

  get typeName() {
    let { type } = this
    type = typeNames[type] || type
    return lodash.startCase(type).toLowerCase()
  }

  get lastActivity() {
    return lodash.max(this.parsed.findAllWordsWithCellType("yearCell").map(word => parseInt(word.word)))
  }

  makeATag(id) {
    const file = this.computer.getConceptPage(id)
    return `<a href="${file.permalink}">${file.title}</a>`
  }

  get trendingRepos() {
    const { title } = this
    const count = this.get(`$githubLanguage trendingProjectsCount`)
    if (parseInt(count) > 0) {
      const table = this.getNode("githubLanguage trendingProjects")
      const githubId = this.get("githubLanguage")

      if (!table) {
        console.log(`Error with ${this.id}`)
        return ""
      }

      const tree = TreeNode.fromSsv(table.childrenToString())
      tree.forEach(child => {
        child.set("repo", child.get("name"))
        child.set("repoLink", child.get("url"))
      })
      return `## Trending <a href="https://github.com/trending/${githubId}?since=monthly">${title} repos</a> on GitHub
commaTable
 ${cleanAndRightShift(tree.toDelimited(",", ["repo", "repoLink", "stars", "description"]))}
`
    }
    return ""
  }

  get semanticScholar() {
    const { title } = this
    const items = this.getNode(`semanticScholar`)
    if (!items) return ""

    if (items.content === "0") return ""

    const tree = TreeNode.fromDelimited(items.childrenToString(), "|")
    tree.forEach(child => {
      child.set("titleLink", `https://www.semanticscholar.org/paper/${child.get("paperId")}`)
    })
    return `## Publications about ${title} from Semantic Scholar
pipeTable
 ${cleanAndRightShift(
   tree.toDelimited("|", ["title", "titleLink", "authors", "year", "citations", "influentialCitations"])
 )}
`
  }

  get isbndb() {
    const { title } = this
    const isbndb = this.getNode(`isbndb`)
    if (!isbndb) return ""

    if (isbndb.content === "0") return ""

    const tree = TreeNode.fromDelimited(isbndb.childrenToString(), "|")
    tree.forEach(child => {
      child.set("titleLink", `https://isbndb.com/book/${child.get("isbn13")}`)
    })
    return `## Books about ${title} from ISBNdb
pipeTable
 ${cleanAndRightShift(tree.toDelimited("|", ["title", "titleLink", "authors", "year", "publisher"]))}
`
  }

  get goodreads() {
    const { title } = this
    const goodreads = this.getNode(`goodreads`) // todo: the goodreadsIds we have are wrong.
    if (!goodreads) return ""

    const tree = TreeNode.fromDelimited(goodreads.childrenToString(), "|")
    tree.forEach(child => {
      child.set("titleLink", `https://www.goodreads.com/search?q=${child.get("title") + " " + child.get("author")}`)
    })
    return `## Books about ${title} on goodreads
pipeTable
 ${cleanAndRightShift(tree.toDelimited("|", ["title", "titleLink", "author", "year", "reviews", "ratings", "rating"]))}
`
  }

  get publications() {
    const { title } = this
    const dblp = this.getNode(`dblp`)
    if (dblp && dblp.get("hits") !== "0") {
      const tree = TreeNode.fromDelimited(dblp.getNode("publications").childrenToString(), "|")
      tree.forEach(child => {
        child.set("titleLink", child.get("doi") ? `https://doi.org/` + child.get("doi") : child.get("url"))
      })
      return `## ${dblp.get("hits")} publications about ${title} on <a href="${this.get("dblp")}">DBLP</a>
pipeTable
 ${cleanAndRightShift(tree.toDelimited("|", ["title", "titleLink", "year"]))}
`
    }
    return ""
  }

  get featuresTable() {
    const { features, id } = this
    if (!features.length) return ""

    const { featuresMap } = this.computer
    const table = new TreeNode()
    features.forEach(node => {
      const feature = featuresMap.get(node.getWord(0))
      if (!feature) {
        console.log(`warning: we need a features page for feature '${node.getWord(0)}' found in '${id}'`)
        return
      }

      const tokenPath = feature.token
      const supported = node.content === "true"

      table
        .appendLineAndChildren(
          `row`,
          `Feature ${feature.title}
FeatureLink ${feature.titleLink}
Supported ${supported ? `<span class="hasFeature">✓</span>` : `<span class="doesNotHaveFeature">X</span>`}
Token ${supported && tokenPath ? this.get(tokenPath) ?? "" : ""}
Example`
        )
        .touchNode("Example")
        .setChildren(node.childrenToString())
    })

    return `## Language <a href="../lists/features.html">features</a>

treeTable
 ${table.sortBy(["Supported", "Example"]).reverse().toString().replace(/\n/g, "\n ")}`
  }

  get hackerNewsTable() {
    const hnTable = this.getNode(`hackerNewsDiscussions`)?.childrenToString()
    if (!hnTable) return ""

    const table = TreeNode.fromDelimited(hnTable, "|")
    table.forEach(row => {
      row.set("titleLink", `https://news.ycombinator.com/item?id=${row.get("id")}`)
      row.set("date", dayjs(row.get("time")).format("MM/DD/YYYY"))
    })

    const delimited = table
      .toDelimited("|", ["title", "titleLink", "date", "score", "comments"])
      .replace(/\n/g, "\n ")
      .trim()
    return `## HackerNews discussions of ${this.title}

pipeTable
 ${delimited}`
  }

  get sourceUrl() {
    return `https://github.com/breck7/pldb/blob/main/concepts/${this.filename}`
  }

  get title() {
    return this.get("id")
  }

  toScroll() {
    const { typeName, title, id, getSource } = this

    if (title.includes("%20")) throw new Error("bad space in title: " + title)

    const sourceCode = getSource
      ? `codeWithHeader Download source code:
 ${getSource}`
      : ""

    return `import ../header.scroll
baseUrl https://pldb.io/concepts/
title ${title} - ${lodash.upperFirst(typeName)}

printTitle ${title}

html
 <a class="trueBaseThemePreviousItem" href="${this.prevPage}">&lt;</a>
 <a class="trueBaseThemeNextItem" href="${this.nextPage}">&gt;</a>

viewSourceUrl ${this.sourceUrl}

wideColumns 1

<div class="trueBaseThemeQuickLinks">${this.quickLinks}</div>

${this.oneLiner}

${this.kpiBar}

${sourceCode}

${this.tryNowRepls}

${this.monacoEditor}

${this.image}

${this.descriptionSection}

${this.factsSection}

<br>

${this.exampleSection}

${this.funFactSection}

${this.keywordsSection}

${this.featuresTable}

${this.trendingRepos}

${this.publications}

${this.hackerNewsTable}

keyboardNav ${this.prevPage} ${this.nextPage}

endColumns

import ../footer.scroll
`.replace(/\n\n\n+/g, "\n\n")
  }

  getAll(keyword) {
    return this.node.findNodes(keyword).map(node => node.content)
  }

  get image() {
    const { title } = this

    let image = this.get("screenshot")
    let caption = `A screenshot of the visual language ${title}.
  link /search.html?q=select+type%0D%0Awhere+type+%3D+visual visual language`
    if (!image) {
      image = this.get("photo")
      caption = `A photo of ${title}.`
    }

    if (!image) return ""

    return `openGraphImage ${image}
image ${image.replace("https://pldb.io/", "../")}
 caption ${caption}`
  }

  get monacoEditor() {
    const monaco = this.get("monaco")
    if (!monaco) return ""

    const exampleToUse = this.allExamples.find(example => !example.code.includes("`")) // our monaco code struggles with backticks for some reason.

    const example = exampleToUse ? exampleToUse.code.replace(/\n/g, "\n ") : ""

    return `monacoEditor ${monaco}
 ${example}`
  }

  get prevPage() {
    return this.previousRanked.permalink
  }

  get nextPage() {
    return this.nextRanked.permalink
  }

  get quickLinks() {
    // Sigh. After learning Material Designs realized
    // it's partially broken on purpose:
    // https://github.com/google/material-design-icons/issues/166
    const SVGS = {
      twitter: `<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
      reddit: `<svg role="img" width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 18.65625 4 C 16.558594 4 15 5.707031 15 7.65625 L 15 11.03125 C 12.242188 11.175781 9.742188 11.90625 7.71875 13.0625 C 6.945313 12.316406 5.914063 12 4.90625 12 C 3.816406 12 2.707031 12.355469 1.9375 13.21875 L 1.9375 13.25 L 1.90625 13.28125 C 1.167969 14.203125 0.867188 15.433594 1.0625 16.65625 C 1.242188 17.777344 1.898438 18.917969 3.03125 19.65625 C 3.023438 19.769531 3 19.882813 3 20 C 3 22.605469 4.574219 24.886719 6.9375 26.46875 C 9.300781 28.050781 12.488281 29 16 29 C 19.511719 29 22.699219 28.050781 25.0625 26.46875 C 27.425781 24.886719 29 22.605469 29 20 C 29 19.882813 28.976563 19.769531 28.96875 19.65625 C 30.101563 18.917969 30.757813 17.777344 30.9375 16.65625 C 31.132813 15.433594 30.832031 14.203125 30.09375 13.28125 L 30.0625 13.25 C 29.292969 12.386719 28.183594 12 27.09375 12 C 26.085938 12 25.054688 12.316406 24.28125 13.0625 C 22.257813 11.90625 19.757813 11.175781 17 11.03125 L 17 7.65625 C 17 6.675781 17.558594 6 18.65625 6 C 19.175781 6 19.820313 6.246094 20.8125 6.59375 C 21.65625 6.890625 22.75 7.21875 24.15625 7.3125 C 24.496094 8.289063 25.414063 9 26.5 9 C 27.875 9 29 7.875 29 6.5 C 29 5.125 27.875 4 26.5 4 C 25.554688 4 24.738281 4.535156 24.3125 5.3125 C 23.113281 5.242188 22.246094 4.992188 21.46875 4.71875 C 20.566406 4.402344 19.734375 4 18.65625 4 Z M 16 13 C 19.152344 13 21.964844 13.867188 23.9375 15.1875 C 25.910156 16.507813 27 18.203125 27 20 C 27 21.796875 25.910156 23.492188 23.9375 24.8125 C 21.964844 26.132813 19.152344 27 16 27 C 12.847656 27 10.035156 26.132813 8.0625 24.8125 C 6.089844 23.492188 5 21.796875 5 20 C 5 18.203125 6.089844 16.507813 8.0625 15.1875 C 10.035156 13.867188 12.847656 13 16 13 Z M 4.90625 14 C 5.285156 14 5.660156 14.09375 5.96875 14.25 C 4.882813 15.160156 4.039063 16.242188 3.53125 17.4375 C 3.277344 17.117188 3.125 16.734375 3.0625 16.34375 C 2.953125 15.671875 3.148438 14.976563 3.46875 14.5625 C 3.472656 14.554688 3.464844 14.539063 3.46875 14.53125 C 3.773438 14.210938 4.3125 14 4.90625 14 Z M 27.09375 14 C 27.6875 14 28.226563 14.210938 28.53125 14.53125 C 28.535156 14.535156 28.527344 14.558594 28.53125 14.5625 C 28.851563 14.976563 29.046875 15.671875 28.9375 16.34375 C 28.875 16.734375 28.722656 17.117188 28.46875 17.4375 C 27.960938 16.242188 27.117188 15.160156 26.03125 14.25 C 26.339844 14.09375 26.714844 14 27.09375 14 Z M 11 16 C 9.894531 16 9 16.894531 9 18 C 9 19.105469 9.894531 20 11 20 C 12.105469 20 13 19.105469 13 18 C 13 16.894531 12.105469 16 11 16 Z M 21 16 C 19.894531 16 19 16.894531 19 18 C 19 19.105469 19.894531 20 21 20 C 22.105469 20 23 19.105469 23 18 C 23 16.894531 22.105469 16 21 16 Z M 21.25 21.53125 C 20.101563 22.597656 18.171875 23.28125 16 23.28125 C 13.828125 23.28125 11.898438 22.589844 10.75 21.65625 C 11.390625 23.390625 13.445313 25 16 25 C 18.554688 25 20.609375 23.398438 21.25 21.53125 Z"/></svg>`,
      wikipedia: `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="98.05px" height="98.05px" viewBox="0 0 98.05 98.05" style="enable-background:new 0 0 98.05 98.05;" xml:space="preserve"><path d="M98.023,17.465l-19.584-0.056c-0.004,0.711-0.006,1.563-0.017,2.121c1.664,0.039,5.922,0.822,7.257,4.327L66.92,67.155 c-0.919-2.149-9.643-21.528-10.639-24.02l9.072-18.818c1.873-2.863,5.455-4.709,8.918-4.843l-0.01-1.968L55.42,17.489 c-0.045,0.499,0.001,1.548-0.068,2.069c5.315,0.144,7.215,1.334,5.941,4.508c-2.102,4.776-6.51,13.824-7.372,15.475 c-2.696-5.635-4.41-9.972-7.345-16.064c-1.266-2.823,1.529-3.922,4.485-4.004v-1.981l-21.82-0.067 c0.016,0.93-0.021,1.451-0.021,2.131c3.041,0.046,6.988,0.371,8.562,3.019c2.087,4.063,9.044,20.194,11.149,24.514 c-2.685,5.153-9.207,17.341-11.544,21.913c-3.348-7.43-15.732-36.689-19.232-44.241c-1.304-3.218,3.732-5.077,6.646-5.213 l0.019-2.148L0,17.398c0.005,0.646,0.027,1.71,0.029,2.187c4.025-0.037,9.908,6.573,11.588,10.683 c7.244,16.811,14.719,33.524,21.928,50.349c0.002,0.029,2.256,0.059,2.281,0.008c4.717-9.653,10.229-19.797,15.206-29.56 L63.588,80.64c0.005,0.004,2.082,0.016,2.093,0.007c7.962-18.196,19.892-46.118,23.794-54.933c1.588-3.767,4.245-6.064,8.543-6.194 l0.032-1.956L98.023,17.465z"/></svg>`
    }

    const links = {
      home: this.website,
      terminal: this.repl,
      code: this.repo,
      menu_book: this.get("documentation"),
      mail: this.get("emailList"),
      wikipedia: this.get(`wikipedia`),
      reddit: this.get("subreddit"),
      twitter: this.get("twitter"),
      edit: `https://jtree.treenotation.org/designer#${encodeURIComponent(
        new TreeNode(
          `url https://pldb.io/pldb.grammar\nprogramUrl https://pldb.io/concepts/${this.filename}`
        ).toString()
      )}`
    }
    return Object.keys(links)
      .filter(key => links[key])
      .map(key =>
        SVGS[key]
          ? `<a href="${links[key]}">${SVGS[key]}</a>`
          : `<a href="${links[key]}" class="material-symbols-outlined">${key}</a>`
      )
      .join(" ")
  }

  get factsSection() {
    return this.facts.map(fact => `- ${fact}`).join("\n")
  }

  get sourceStatus() {
    const value = this.get("isOpenSource")
    if (value === undefined) return ""
    return value ? " open source" : " closed source"
  }

  get oneLiner() {
    const { typeName, title, creators, appeared, sourceStatus } = this
    const standsFor = this.get("standsFor")
    let akaMessage = standsFor ? `, aka ${standsFor},` : ""

    let creatorsStr = ""
    let creatorsLinks = ""
    if (creators.length) {
      creatorsStr = ` by ` + creators.join(" and ")
      creatorsLinks = creators
        .map(name => ` link ../lists/creators.html#q=${encodeURIComponent(name)} ${name}`)
        .join("\n")
    }

    return `* ${title}${akaMessage} is ${Utils.getIndefiniteArticle(sourceStatus || typeName)}${sourceStatus} ${
      this.typeLink
    }${appeared ? ` created in ${appeared}` : ""}${creatorsStr}.
 link ../lists/explorer.html#searchBuilder=%7B%22criteria%22%3A%5B%7B%22condition%22%3A%22%3D%22%2C%22data%22%3A%22appeared%22%2C%22origData%22%3A%22appeared%22%2C%22type%22%3A%22num%22%2C%22value%22%3A%5B%22${appeared}%22%5D%7D%5D%2C%22logic%22%3A%22AND%22%7D ${appeared}
${creatorsLinks}
`
  }

  get typeLink() {
    const { type } = this
    return `<a href="../lists/explorer.html#searchBuilder=%7B%22criteria%22%3A%5B%7B%22condition%22%3A%22%3D%22%2C%22data%22%3A%22type%22%2C%22origData%22%3A%22type%22%2C%22type%22%3A%22string%22%2C%22value%22%3A%5B%22${type}%22%5D%7D%5D%2C%22logic%22%3A%22AND%22%7D">${this.typeName}</a>`
  }

  get descriptionSection() {
    let description = ""
    const authoredDescription = this.get("description")
    const wikipediaSummary = this.get("wikipedia summary")
    const ghDescription = this.get("githubRepo description")
    const wpLink = this.get(`wikipedia`)
    if (wikipediaSummary)
      description =
        wikipediaSummary.split(". ").slice(0, 3).join(". ") +
        `. Read more on Wikipedia...\n ${wpLink} Read more on Wikipedia...`
    else if (authoredDescription) description = authoredDescription
    else if (ghDescription) description = ghDescription
    return `* ${description}`
  }

  get facts() {
    const { title, website } = this

    const facts = []
    if (website) facts.push(`${title} website\n ${website}`)

    const downloadPageUrl = this.get("downloadPageUrl")
    if (downloadPageUrl) facts.push(`${title} downloads page\n ${downloadPageUrl}`)

    const wikipediaLink = this.get("wikipedia")
    const wikiLink = wikipediaLink ? wikipediaLink : ""
    if (wikiLink) facts.push(`${title} Wikipedia page\n ${wikiLink}`)

    const githubRepo = this.node.getNode("githubRepo")
    if (githubRepo) {
      const stars = githubRepo.get("stars")
      const starMessage = stars ? ` and has ${numeral(stars).format("0,0")} stars` : ""
      facts.push(`${title} is developed on <a href="${githubRepo.getWord(1)}">GitHub</a>${starMessage}`)
    }

    const gource = this.get("gource")
    if (gource) facts.push(`Watch the history of <a href="${gource}">the ${title} repo visualized with Gource</a>`)

    const gitlabRepo = this.get("gitlabRepo")
    if (gitlabRepo) facts.push(`${title} on GitLab\n ${gitlabRepo}`)

    const documentationLinks = this.getAll("documentation")
    if (documentationLinks.length === 1) facts.push(`${title} docs\n ${documentationLinks[0]}`)
    else if (documentationLinks.length > 1)
      facts.push(
        `PLDB has ${documentationLinks.length} documentation sites for ${title}: ${documentationLinks
          .map(makePrettyUrlLink)
          .join(", ")}`
      )

    const specLinks = this.getAll("spec")
    if (specLinks.length === 1) facts.push(`${title} specs\n ${specLinks[0]}`)
    else if (specLinks.length > 1)
      facts.push(
        `PLDB has ${specLinks.length} specification sites for ${title}: ${specLinks.map(makePrettyUrlLink).join(", ")}`
      )

    const emailListLinks = this.getAll("emailList")
    if (emailListLinks.length === 1) facts.push(`${title} mailing list\n ${emailListLinks[0]}`)
    else if (emailListLinks.length > 1)
      facts.push(
        `PLDB has ${emailListLinks.length} mailing list sites for ${title}: ${emailListLinks
          .map(makePrettyUrlLink)
          .join(", ")}`
      )

    const demoVideo = this.get("demoVideo")
    if (demoVideo) facts.push(`Video demo of ${title}\n ${demoVideo}`)

    const githubRepoCount = this.get("githubLanguage repos")
    if (githubRepoCount) {
      const url = `https://github.com/search?q=language:${this.get("githubLanguage")}`
      const repoCount = numeral(githubRepoCount).format("0,0")
      facts.push(`There are at least ${repoCount} ${title} repos on <a href="${url}">GitHub</a>`)
    }

    const supersetOf = this.getRelationshipFile("supersetOf")
    if (supersetOf)
      facts.push(
        `${title} is a <a href="../lists/explorer.html#columns=rank~id~appeared~type~creators~supersetOf&searchBuilder=%7B%22criteria%22%3A%5B%7B%22condition%22%3A%22!null%22%2C%22data%22%3A%22supersetOf%22%2C%22origData%22%3A%22supersetOf%22%2C%22type%22%3A%22html%22%2C%22value%22%3A%5B%5D%7D%5D%2C%22logic%22%3A%22AND%22%7D">superset</a> of ${supersetOf.link()}`
      )

    const implementationOf = this.getRelationshipFile("implementationOf")
    if (implementationOf) facts.push(`${title} is an implementation of ${implementationOf.link()}`)

    const { originCommunity } = this
    let originCommunityStr = ""
    if (originCommunity.length) {
      originCommunityStr = originCommunity
        .map(name => `<a href="../lists/originCommunities.html#q=${name}">${name}</a>`)
        .join(" and ")
      facts.push(`${title} first developed in ${originCommunityStr}`)
    }

    const { numberOfJobsEstimate } = this
    const jobs = numberOfJobsEstimate > 10 ? numeral(numberOfJobsEstimate).format("0a") : ""
    if (jobs) facts.push(`PLDB estimates there are currently ${jobs} job openings for ${title} programmers.`)

    const { extensions } = this
    if (extensions) facts.push(`file extensions for ${title} include ${toCommaList(extensions.split(" "))}`)

    const compilesTo = this.get("compilesTo")
    if (compilesTo)
      facts.push(
        `${title} compiles to ${compilesTo
          .split(" ")
          .map(link => this.makeATag(link))
          .join(" or ")}`
      )

    const writtenIn = this.get("writtenIn")
    if (writtenIn)
      facts.push(
        `${title} is written in ${writtenIn
          .split(" ")
          .map(link => this.makeATag(link))
          .join(" & ")}`
      )

    const twitter = this.get("twitter")
    if (twitter) facts.push(`${title} on Twitter\n ${twitter}`)

    const conferences = this.node.getNodesByGlobPath("conference")
    if (conferences.length) {
      facts.push(
        `Recurring conference about ${title}: ${conferences.map(
          tree => `<a href="${tree.getWord(1)}">${tree.getWordsFrom(2)}</a>`
        )}`
      )
    }

    const githubBigQuery = this.node.getNode("githubBigQuery")
    if (githubBigQuery) {
      const url = `https://api.github.com/search/repositories?q=language:${githubBigQuery.content}`
      const userCount = numeral(githubBigQuery.get("users")).format("0a")
      const repoCount = numeral(githubBigQuery.get("repos")).format("0a")
      facts.push(
        `The  Google BigQuery Public Dataset GitHub snapshot shows ${userCount} users using ${title} in ${repoCount} repos on <a href="${url}">GitHub</a>`
      )
    }

    const meetup = this.get("meetup")
    if (meetup) {
      const groupCount = numeral(this.get("meetup groupCount")).format("0,0")
      facts.push(`Check out the ${groupCount} <a href="${meetup}/">${title} meetup groups</a> on Meetup.com.`)
    }

    const firstAnnouncement = this.get("firstAnnouncement")
    const announcementMethod = this.get("announcementMethod")
    if (firstAnnouncement)
      facts.push(
        `<a href="${firstAnnouncement}">First announcement of</a> ${title}${
          announcementMethod ? " via " + announcementMethod : ""
        }`
      )

    const subreddit = this.get("subreddit")
    if (subreddit) {
      const peNum = numeral(this.getMostRecentInt("subreddit memberCount")).format("0,0")
      facts.push(`There are ${peNum} members in the <a href="${subreddit}">${title} subreddit</a>`)
    }

    const pe = this.get("projectEuler")
    if (pe) {
      const peNum = numeral(this.getMostRecentInt("projectEuler memberCount")).format("0,0")
      facts.push(
        `There are ${peNum} <a href="https://projecteuler.net/language=${pe}">Project Euler</a> users using ${title}`
      )
    }

    const soSurvey = this.node.getNode("stackOverflowSurvey 2021")
    if (soSurvey) {
      let fact = `In the 2021 StackOverflow <a href="https://insights.stackoverflow.com/survey">developer survey</a> ${title} programmers reported a median salary of $${numeral(
        soSurvey.get("medianSalary")
      ).format("0,0")}. `

      fact += `${lodash.round(
        parseFloat(soSurvey.get("percentageUsing")) * 100,
        2
      )}% of respondents reported using ${title}. `

      fact += `${numeral(soSurvey.get("users")).format("0,0")} programmers reported using ${title}, and ${numeral(
        soSurvey.get("fans")
      ).format("0,0")} said they wanted to use it`

      facts.push(fact)
    }

    const rosettaCode = this.get("rosettaCode")
    if (rosettaCode) facts.push(`Explore ${title} snippets on <a href="${rosettaCode}">Rosetta Code</a>`)

    const nativeLanguage = this.get("nativeLanguage")
    if (nativeLanguage) facts.push(`${title} is written with the native language of ${nativeLanguage}`)

    const gdb = this.get("gdbSupport")
    if (gdb) facts.push(`${title} is supported by the <a href="https://www.sourceware.org/gdb/">GDB</a>`)

    const hopl = this.get("hopl")
    if (hopl) facts.push(`${title} on HOPL\n ${hopl}`)

    const tiobe = this.get("tiobe")
    const tiobeRank = this.get("tiobe currentRank")
    if (tiobeRank)
      facts.push(`${title} ranks #${tiobeRank} in the <a href="https://www.tiobe.com/tiobe-index/">TIOBE Index</a>`)
    else if (tiobe) facts.push(`${title} appears in the <a href="https://www.tiobe.com/tiobe-index/">TIOBE Index</a>`)

    const esolang = this.get("esolang")
    if (esolang) facts.push(`${title} on Esolang\n ${esolang}`)

    const ubuntu = this.get("ubuntuPackage")
    if (ubuntu) facts.push(`${title} Ubuntu package\n https://packages.ubuntu.com/jammy/${ubuntu}`)

    const antlr = this.get("antlr")
    if (antlr) facts.push(`<a href="antlr.html">ANTLR</a> <a href="${antlr}">grammar</a> for ${title}`)

    // todo: handle multiple
    const lsp = this.get("languageServerProtocolProject")
    if (lsp) facts.push(`${title} <a href="language-server-protocol.html">LSP</a> <a href="${lsp}">implementation</a>`)

    const codeMirror = this.get("codeMirror")
    if (codeMirror)
      facts.push(
        `<a href="codemirror.html">CodeMirror</a> <a href="https://github.com/codemirror/codemirror5/tree/master/mode/${codeMirror}">package</a> for syntax highlighting ${title}`
      )

    const monaco = this.get("monaco")
    if (monaco)
      facts.push(
        `<a href="monaco.html">Monaco</a> <a href="https://github.com/microsoft/monaco-editor/tree/main/src/basic-languages/${monaco}">package</a> for syntax highlighting ${title}`
      )

    const pygmentsHighlighter = this.get("pygmentsHighlighter")
    if (pygmentsHighlighter)
      facts.push(
        `<a href="pygments.html">Pygments</a> supports <a href="https://github.com/pygments/pygments/blob/master/pygments/lexers/${this.get(
          "pygmentsHighlighter filename"
        )}">syntax highlighting</a> for ${title}`
      )

    const linguist = this.get("linguistGrammarRepo")
    if (linguist)
      facts.push(
        `GitHub supports <a href="${linguist}" title="The package used for syntax highlighting by GitHub Linguist.">syntax highlighting</a> for ${title}`
      )

    const quineRelay = this.get("quineRelay")
    if (quineRelay)
      facts.push(`${title} appears in the <a href="https://github.com/mame/quine-relay">Quine Relay</a> project`)

    const jupyters = this.getAll("jupyterKernel")
    if (jupyters.length === 1)
      facts.push(
        `There is 1 <a href="jupyter-notebook.html">Jupyter</a> <a href="${jupyters[0]}">Kernel</a> for ${title}`
      )
    else if (jupyters.length > 1)
      facts.push(
        `PLDB has ${jupyters.length} <a href="jupyter-notebook.html">Jupyter</a> Kernels for ${title}: ${jupyters
          .map(makePrettyUrlLink)
          .join(", ")}`
      )

    const packageRepos = this.getAll("packageRepository")
    if (packageRepos.length === 1)
      facts.push(`There is a <a href="${packageRepos[0]}">central package repository</a> for ${title}`)
    else if (packageRepos.length > 1)
      facts.push(
        `There are ${packageRepos.length} central package repositories for ${title}: ${linkManyAftertext(packageRepos)}`
      )

    const annualReport = this.getAll("annualReportsUrl")

    if (annualReport.length >= 1) facts.push(`Annual Reports for ${title}\n ${annualReport[0]}`)

    const releaseNotes = this.getAll("releaseNotesUrl")

    if (releaseNotes.length >= 1) facts.push(`Release Notes for ${title}\n ${releaseNotes[0]}`)
    const officialBlog = this.getAll("officialBlogUrl")

    if (officialBlog.length >= 1) facts.push(`Official Blog page for ${title}\n ${officialBlog[0]}`)
    const eventsPage = this.getAll("eventsPageUrl")

    if (eventsPage.length >= 1) facts.push(`Events page for ${title}\n ${eventsPage[0]}`)

    const faqPage = this.getAll("faqPageUrl")

    if (faqPage.length >= 1) facts.push(`Frequently Asked Questions for ${title}\n ${faqPage[0]}`)

    const cheatSheetUrl = this.get("cheatSheetUrl")
    if (cheatSheetUrl) facts.push(`${title} cheat sheet\n ${cheatSheetUrl}`)

    const indeedJobs = this.node.getNode("indeedJobs")
    if (indeedJobs) {
      const query = this.get("indeedJobs")
      const jobCount = numeral(this.getMostRecentInt("indeedJobs")).format("0,0")
      facts.push(
        `Indeed.com has ${jobCount} matches for <a href="https://www.indeed.com/jobs?q=${query}">"${query}"</a>.`
      )
    }

    const domainRegistered = this.get("domainName registered")
    if (domainRegistered)
      facts.push(`<a href="${website}">${this.get("domainName")}</a> was registered in ${domainRegistered}`)

    const wpRelated = this.get("wikipedia related")
    const seeAlsoLinks = wpRelated ? wpRelated.split(" ") : []
    const related = this.get("related")
    if (related) related.split(" ").forEach(id => seeAlsoLinks.push(id))

    if (seeAlsoLinks.length)
      facts.push(
        "See also: " +
          `(${seeAlsoLinks.length} related languages)` +
          seeAlsoLinks.map(link => this.makeATag(link)).join(", ")
      )

    const { otherReferences } = this

    const semanticScholarReferences = otherReferences.filter(link => link.includes("semanticscholar"))
    const nonSemanticScholarReferences = otherReferences.filter(link => !link.includes("semanticscholar"))

    if (semanticScholarReferences.length)
      facts.push(`Read more about ${title} on Semantic Scholar: ${linkManyAftertext(semanticScholarReferences)}`)
    if (nonSemanticScholarReferences.length)
      facts.push(`Read more about ${title} on the web: ${linkManyAftertext(nonSemanticScholarReferences)}`)

    return facts
  }

  get keywordsSection() {
    const keywords = this.get("keywords")
    if (!keywords) return ""
    return `<div class="keywordsBlock">
codeWithHeader ${this.title} <a href="../lists/keywords.html#q=${this.id}">Keywords</a>
 ${keywords}
</div>`
  }

  get funFactSection() {
    return this.node
      .findNodes("funFact")
      .map(
        fact =>
          `codeWithHeader ${`<a href='${fact.content}'>Fun fact</a>`}:
 ${cleanAndRightShift(lodash.escape(fact.childrenToString()))}`
      )
      .join("\n\n")
  }

  get exampleSection() {
    return this.allExamples
      .map(
        example =>
          `codeWithHeader Example from ${
            !example.link ? example.source : `<a href='${example.link}'>` + example.source + "</a>"
          }:
 ${cleanAndRightShift(lodash.escape(example.code))}`
      )
      .join("\n\n")
  }

  get tryNowRepls() {
    const repls = []

    const webRepl = this.get("webRepl")
    if (webRepl) repls.push(`<a href="${webRepl}">Web</a>`)

    const rijuRepl = this.get("rijuRepl")
    if (rijuRepl) repls.push(`<a href="${rijuRepl}">Riju</a>`)

    const tryItOnline = this.get("tryItOnline")
    if (tryItOnline) repls.push(`<a href="https://tio.run/#${tryItOnline}">TIO</a>`)

    const replit = this.get("replit")
    if (replit) repls.push(`<a href="${replit}">Replit</a>`)

    if (!repls.length) return ""

    return `* Try now: ` + repls.join(" · ")
  }

  get kpiBar() {
    const { appeared, title, isLanguage, languageRank } = this
    const numberOfRepos = this.get("githubLanguage repos")

    const lines = [
      isLanguage ? `#${languageRank} <span title="${this.langRankDebug}">on PLDB</span>` : `#${this.rank} on PLDB`,
      appeared ? `${currentYear - appeared} Years Old` : "",
      numberOfRepos ? `${numeral(numberOfRepos).format("0a")} <span title="${title} repos on GitHub.">Repos</span>` : ""
    ]
      .filter(i => i)
      .join("\n ")

    return `dashboard
 ${lines}`
  }
}

// One feature maps to one Parser that extends abstractFeatureParser
class Feature {
  constructor(measure, computer) {
    this.measure = measure
    this.fileName = "pldbMeasures.scroll"
    this.id = measure.Name
    this.computer = computer
  }

  id = ""
  fileName = ""

  get permalink() {
    return this.id + ".html"
  }

  get yes() {
    return this.languagesWithThisFeature.length
  }

  get no() {
    return this.languagesWithoutThisFeature.length
  }

  get percentage() {
    const { yes, no } = this
    const measurements = yes + no
    return measurements < 100 ? "-" : lodash.round((100 * yes) / measurements, 0) + "%"
  }

  get aka() {
    return this.get("aka") // .join(" or "),
  }

  get token() {
    return this.get("tokenKeyword")
  }

  get titleLink() {
    return `../features/${this.permalink}`
  }

  get(word) {
    // todo; fix this
    // return this.measure[word]
    return this.node.getFrom(`string ${word}`)
  }

  get node() {
    return ParserFile.getNode(this.id + "Parser")
  }

  get title() {
    return this.get("title") || this.id
  }

  get pseudoExample() {
    return (this.get("pseudoExample") || "").replace(/\</g, "&lt;").replace(/\|/g, "&#124;")
  }

  get references() {
    return (this.get("reference") || "").split(" ").filter(i => i)
  }

  get languagesWithThisFeature() {
    const { id } = this
    return this.getLanguagesWithFeatureResearched(id).filter(file => file[id])
  }

  get languagesWithoutThisFeature() {
    const { id } = this
    return this.getLanguagesWithFeatureResearched(id).filter(file => !file[id])
  }

  getLanguagesWithFeatureResearched(id) {
    if (!this.computer.featureCache) this.computer.featureCache = {}
    if (this.computer.featureCache[id]) return this.computer.featureCache[id]
    // todo: re-add support for "extended"
    this.computer.featureCache[id] = this.computer.pldb.filter(file => file[id] !== "")
    return this.computer.featureCache[id]
  }

  get summary() {
    const { id, title, fileName, titleLink, aka, token, yes, no, percentage, pseudoExample } = this
    return {
      id,
      title,
      fileName,
      titleLink,
      aka,
      token,
      yes,
      no,
      measurements: yes + no,
      percentage,
      pseudoExample
    }
  }

  toScroll() {
    const { title, id, fileName, references, previous, next } = this

    const positives = this.languagesWithThisFeature
    const positiveText = `* Languages *with* ${title} include ${positives
      .map(file => `<a href="../concepts/${file.filename.replace(".scroll", ".html")}">${file.id}</a>`)
      .join(", ")}`

    const negatives = this.languagesWithoutThisFeature
    const negativeText = negatives.length
      ? `* Languages *without* ${title} include ${negatives
          .map(file => `<a href="../concepts/${file.filename.replace(".scroll", ".html")}">${file.id}</a>`)
          .join(", ")}`
      : ""

    const examples = positives
      .filter(file => this.computer.getConceptFile(file.filename).getNode(id).length)
      .map(file => {
        return {
          id: file.filename,
          title: file.id,
          example: this.computer.getConceptFile(file.filename).getNode(id).childrenToString()
        }
      })
    const grouped = lodash.groupBy(examples, "example")
    const examplesText = Object.values(grouped)
      .map(group => {
        const links = group.map(hit => `<a href="../concepts/${hit.id.replace(".scroll", "")}.html">${hit.title}</a>`)

        return `codeWithHeader Example from <b>${links.length} languages</b>: ${links.join(", ")}
 ${shiftRight(removeReturnChars(lodash.escape(group[0].example)), 1)}`
      })
      .join("\n\n")

    let referencesText = ""
    if (references.length) referencesText = `* Read more about ${title} on the web: ${linkManyAftertext(references)}`

    let descriptionText = ""
    const description = this.measure.Description
    if (description) descriptionText = `* This question asks: ${description}`

    return `import header.scroll

title ${title} - language feature
printTitle ${title}

html
 <a class="trueBaseThemePreviousItem" href="${previous.permalink}">&lt;</a>
 <a class="trueBaseThemeNextItem" href="${next.permalink}">&gt;</a>

// viewSourceUrl https://github.com/breck7/pldb/blob/main/measures/${fileName}

mediumColumns 1

${examplesText}

***

${[positiveText, negativeText, descriptionText, referencesText].filter(i => i).join("\n\n***\n\n")}

endColumns

keyboardNav ${previous.permalink} ${next.permalink}

import ../footer.scroll
`.replace(/\n\n\n+/g, "\n\n")
  }
}

const getMostRecentInt = (concept, pathToSet) => {
  let set = concept.getNode(pathToSet)
  if (!set) return 0
  set = set.toObject()
  const key = Math.max(...Object.keys(set).map(year => parseInt(year)))
  return parseInt(set[key])
}

const getJoined = (row, keywords) => {
  const words = keywords
    .map(word => row[word] || "")
    .filter(i => i)
    .join(" ")
    .split(" ")
  return lodash.uniq(words).join(" ")
}

const groupByListValues = (listColumnName, rows, delimiter = " && ") => {
  const values = {}
  rows.forEach(row => {
    const value = row[listColumnName]
    if (!value) return
    value.split(delimiter).forEach(value => {
      if (!values[value]) values[value] = []
      values[value].push(row)
    })
  })
  return values
}

class Tables {
  constructor() {
    this.quickCache = {}
  }

  get top1000() {
    return this.toTable(this.top.slice(0, 1000))
  }

  get all() {
    return this.toTable(this.top)
  }

  _cache = {}
  getConceptFile(filename) {
    if (!this._cache[filename])
      this._cache[filename] = new TreeNode(Disk.read(path.join(__dirname, "concepts", filename)))
    return this._cache[filename]
  }

  toTable(data) {
    const header = lodash.keys(data[0]).join("\t")
    const rows = lodash.map(data, row => lodash.values(row).join("\t"))
    const tsv = [header, ...rows].join("\n ")
    return "tabTable\n " + tsv
  }

  _top
  get top() {
    if (this._top) return this._top
    const { pldb } = this
    this._top = lodash
      .chain(pldb)
      .orderBy(["rank"], ["asc"])
      .map(row =>
        lodash.pick(row, [
          "id",
          "filename",
          "rank",
          "appeared",
          "type",
          "creators",
          "numberOfUsersEstimate",
          "numberOfJobsEstimate",
          "measurements"
        ])
      )
      .value()
      .map(row => {
        row.idLink = "../concepts/" + row.filename.replace(".scroll", ".html")
        delete row.filename
        return row
      })
    return this._top
  }

  get pldb() {
    return require("./pldb.json")
  }

  get languages() {
    return this.pldb.filter(file => file.isLanguage)
  }

  _getFileAtRank(rank, ranks) {
    rank = rank - 1
    const count = Object.keys(ranks).length
    if (rank < 0) rank = count - 1
    if (rank >= count) rank = 0
    return this.getConceptPage(ranks[rank].filename)
  }

  getFileAtRank(rank) {
    return this._getFileAtRank(rank, this.pldb)
  }

  getFileAtLanguageRank(rank) {
    return this._getFileAtRank(rank, this.languages)
  }

  initConceptPages() {
    if (this._conceptPageCache) return
    this._conceptPageCache = {}
    this._conceptPages = []
    this.pldb.forEach(file => {
      const name = file.filename.replace(".scroll", "")
      const page = new ConceptPage(name, file, this)
      this._conceptPageCache[name] = page
      this._conceptPages.push(page)
    })
  }

  getConceptPage(name) {
    this.initConceptPages()
    return this._conceptPageCache[name.replace(".scroll", "")]
  }

  getLanguageTemplate(absolutePath) {
    if (absolutePath.endsWith("conceptPage.scroll")) return ""
    const name = path.basename(absolutePath).replace(".scroll", "")
    return this.getConceptPage(name).toScroll()
  }

  get measures() {
    return require("./measures.json")
  }

  get featuresMap() {
    if (this.quickCache.featuresMap) return this.quickCache.featuresMap
    this.quickCache.featuresMap = new Map()
    const featuresMap = this.quickCache.featuresMap
    this.features.forEach(feature => featuresMap.set(feature.id, feature))
    return featuresMap
  }

  get features() {
    const features = this.measures
      .filter(measure => measure.SortIndex === 42)
      .map(measure => {
        const feature = new Feature(measure, this)
        if (!feature.title) {
          throw new Error(`Feature ${measure} has no title.`)
        }
        return feature
      })

    let previous = features[features.length - 1]
    features.forEach((feature, index) => {
      feature.previous = previous
      feature.next = features[index + 1]
      previous = feature
    })
    features[features.length - 1].next = features[0]

    return features
  }

  getFeaturesImports(limit = 0) {
    const { features } = this
    const topFeatures = lodash.sortBy(features, "yes")
    topFeatures.reverse()
    const summaries = topFeatures.map(feature => feature.summary).filter(feature => feature.measurements >= limit)
    return {
      COUNT: numeral(summaries.length).format("0,0"),
      TABLE: quickTree(summaries, ["title", "titleLink", "pseudoExample", "yes", "no", "percentage"])
    }
  }

  get topFeaturesImports() {
    return this.getFeaturesImports(10)
  }

  get allFeaturesImports() {
    return this.getFeaturesImports(0)
  }

  writeAllFeaturePages() {
    this.features.forEach(feature => {
      Disk.write(path.join(__dirname, "features", feature.id + ".scroll"), feature.toScroll())
    })
  }

  get creators() {
    const entities = groupByListValues(
      "creators",
      this.pldb.filter(row => row.isLanguage),
      " and "
    )
    const wikipediaLinks = new TreeNode(Disk.read(path.join(listsFolder, "creators.tree")))

    const rows = Object.keys(entities).map(name => {
      const group = lodash.sortBy(entities[name], "languageRank")
      const person = wikipediaLinks.nodesThatStartWith(name)[0]
      const anchorTag = lodash.camelCase(name)

      return {
        name: !person
          ? `<a name='${anchorTag}' />${name}`
          : `<a name='${anchorTag}' href='https://en.wikipedia.org/wiki/${person.get("wikipedia")}'>${name}</a>`,
        languages: group
          .map(file => `<a href='../concepts/${file.filename.replace(".scroll", ".html")}'>${file.id}</a>`)
          .join(" - "),
        count: group.length,
        topRank: group[0].languageRank
      }
    })

    return {
      TABLE: quickTree(lodash.sortBy(rows, "topRank"), ["name", "languages", "count", "topRank"]),
      COUNT: numeral(Object.values(entities).length).format("0,0")
    }
  }

  get extensions() {
    const files = this.pldb
      .map(row => {
        row.extensions = getJoined(row, [
          "fileExtensions",
          "githubLanguage_fileExtensions",
          "pygmentsHighlighter_fileExtensions",
          "wikipedia_fileExtensions"
        ])
        return row
      })
      .filter(file => file.extensions)
      .map(file => {
        return {
          name: file.id,
          nameLink: `../concepts/${file.filename.replace(".scroll", ".html")}`,
          rank: file.rank,
          extensions: file.extensions
        }
      })

    const allExtensions = new Set()
    files.forEach(file => file.extensions.split(" ").forEach(ext => allExtensions.add(ext)))

    files.forEach(file => (file.numberOfExtensions = file.extensions.split(" ").length))

    return {
      EXTENSION_COUNT: numeral(allExtensions.size).format("0,0"),
      TABLE: quickTree(lodash.sortBy(files, "rank"), ["name", "nameLink", "extensions", "numberOfExtensions"]),
      LANG_WITH_DATA_COUNT: files.length
    }
  }

  get originCommunities() {
    const files = lodash.sortBy(
      this.pldb.filter(file => file.isLanguage && file.originCommunity.length),
      "languageRank"
    )

    const entities = groupByListValues("originCommunity", files)
    const rows = Object.keys(entities).map(name => {
      const group = entities[name]
      const languages = group.map(lang => `<a href='../concepts/${lang.id}.html'>${lang.id}</a>`).join(" - ")
      const count = group.length
      const top = -Math.min(...group.map(lang => lang.languageRank))

      const wrappedName = `<a name='${lodash.camelCase(name)}' />${name}`

      return { name: wrappedName, languages, count, top }
    })
    const sorted = lodash.sortBy(rows, ["count", "top"])
    sorted.reverse()

    return {
      TABLE: quickTree(sorted, ["count", "name", "languages"]),
      COUNT: numeral(Object.values(entities).length).format("0,0")
    }
  }

  get autocompleteJs() {
    const json = JSON.stringify(
      this.pldb.map(file => {
        const permalink = file.filename.replace(".scroll", "")
        return {
          label: file.id,
          id: permalink,
          url: `/concepts/${permalink}.html`
        }
      }),
      undefined,
      2
    )
    const js =
      Disk.read(path.join(__dirname, "browser", "autocompleter.js")) +
      "\n" +
      `var autocompleteJs = ` +
      json +
      "\n\n" +
      Disk.read(path.join(__dirname, "browser", "client.js"))
    return `plainText\n ` + js.replace(/\n/g, "\n ")
  }

  get keywordsImports() {
    const { rows, langsWithKeywordsCount } = this.keywordsTable

    return {
      NUM_KEYWORDS: numeral(rows.length).format("0,0"),
      LANGS_WITH_KEYWORD_DATA: langsWithKeywordsCount,
      KEYWORDS_TABLE: quickTree(rows, ["keyword", "count", "frequency", "langs"])
    }
  }

  get keywordsTable() {
    if (this.quickCache.keywordsTable) return this.quickCache.keywordsTable
    this.initConceptPages()
    const langsWithKeywords = this._conceptPages.filter(file => file.node.has("keywords"))
    const langsWithKeywordsCount = langsWithKeywords.length

    const keywordsMap = {}
    langsWithKeywords.forEach(file => {
      file.keywords.forEach(keyword => {
        const keywordKey = "Q" + keyword // b.c. you cannot have a key "constructor" in JS objects.

        if (!keywordsMap[keywordKey])
          keywordsMap[keywordKey] = {
            keyword,
            ids: []
          }

        const row = keywordsMap[keywordKey]

        row.ids.push(file.filename)
      })
    })

    const rows = Object.values(keywordsMap)
    rows.forEach(row => {
      row.count = row.ids.length
      row.langs = row.ids
        .map(id => {
          const file = this.getConceptPage(id)
          return `<a href='../concepts/${file.filename.replace(".scroll", ".html")}'>${file.id}</a>`
        })
        .join(" ")
      row.frequency = Math.round(100 * lodash.round(row.count / langsWithKeywordsCount, 2)) + "%"
    })

    this.quickCache.keywordsTable = {
      langsWithKeywordsCount,
      rows: lodash.sortBy(rows, "count").reverse()
    }

    return this.quickCache.keywordsTable
  }

  get acknowledgements() {
    const sources = this.measures.map(col => col.Source).filter(i => i)
    let writtenIn = [
      "javascript",
      "nodejs",
      "html",
      "css",
      "treenotation",
      "scroll",
      "grammar",
      "python",
      "bash",
      "markdown",
      "json",
      "typescript",
      "png-format",
      "svg",
      "explorer",
      "gitignore"
    ].map(s => this.getConceptPage(s).parsed)

    const npmPackages = Object.keys({
      ...require("./package.json").devDependencies
    })
    npmPackages.sort()

    return {
      WRITTEN_IN_TABLE: lodash
        .sortBy(writtenIn, "rank")
        .map(file => `- ${file.id}\n link ../concepts/${file.filename.replace(".scroll", ".html")}`)
        .join("\n"),
      PACKAGES_TABLE: npmPackages.map(s => `- ${s}\n https://www.npmjs.com/package/${s}`).join("\n"),
      SOURCES_TABLE: sources.map(s => `- ${s}\n https://${s}`).join("\n"),
      CONTRIBUTORS_TABLE: JSON.parse(Disk.read(path.join(pagesDir, "contributors.json")))
        .filter(item => item.login !== "codelani" && item.login !== "breck7" && item.login !== "pldbbot")
        .map(item => `- ${item.login}\n ${item.html_url}`)
        .join("\n")
    }
  }
}

const computeds = {
  numberOfUsersEstimate(concept) {
    const mostRecents = ["linkedInSkill", "subreddit memberCount", "projectEuler members"]
    const directs = ["meetup members", "githubRepo stars"]
    const customs = {
      wikipedia: v => 20,
      packageRepository: v => 1000, // todo: pull author number
      "wikipedia dailyPageViews": count => 100 * (parseInt(count) / 20), // say its 95% bot traffic, and 1% of users visit the wp page daily
      linguistGrammarRepo: c => 200, // According to https://github.com/github/linguist/blob/master/CONTRIBUTING.md, linguist indicates a min of 200 users.
      codeMirror: v => 50,
      website: v => 1,
      githubRepo: v => 1,
      "githubRepo forks": v => v * 3,
      annualReport: v => 1000
    }

    return Math.round(
      lodash.sum(mostRecents.map(key => getMostRecentInt(concept, key))) +
        lodash.sum(directs.map(key => parseInt(concept.get(key) || 0))) +
        lodash.sum(
          Object.keys(customs).map(key => {
            const val = concept.get(key)
            return val ? customs[key](val) : 0
          })
        )
    )
  },

  numberOfJobsEstimate(concept) {
    return Math.round(getMostRecentInt(concept, "linkedInSkill") * 0.01) + getMostRecentInt(concept, "indeedJobs")
  },

  exampleCount(concept) {
    return concept.topDownArray.filter(node => node.isExampleCode).length
  },

  score(concept) {},

  measurements(concept) {
    let count = 0
    concept.forEach(node => {
      if (node.isMeasure) count++
    })
    return count
  },

  bookCount(concept) {
    const gr = concept.getNode(`goodreads`)?.length
    const isbndb = concept.getNode(`isbndb`)?.length
    let count = 0
    if (gr) count += gr - 1
    if (isbndb) count += isbndb - 1
    return count
  },

  paperCount(concept) {
    const ss = concept.getNode(`semanticScholar`)?.length
    let count = 0
    if (ss) count += ss - 1
    return count
  },

  hoplId(concept) {
    const id = concept.get("hopl")?.replace("https://hopl.info/showlanguage.prx?exp=", "")
    return id === undefined ? "" : parseInt(id)
  },

  lastActivity(concept) {
    return lodash.max(concept.findAllWordsWithCellType("yearCell").map(word => parseInt(word.word)))
  },

  isLanguage(concept) {
    const nonLanguages = {
      vm: true,
      linter: true,
      library: true,
      webApi: true,
      characterEncoding: true,
      cloud: true,
      editor: true,
      filesystem: true,
      feature: true,
      packageManager: true,
      os: true,
      application: true,
      framework: true,
      standard: true,
      hashFunction: true,
      compiler: true,
      decompiler: true,
      binaryExecutable: true,
      binaryDataFormat: true,
      equation: true,
      interpreter: true,
      computingMachine: true,
      dataStructure: true
    }
    // todo: this should just search for "computerLanguage" in type
    const type = concept.get("type")
    return nonLanguages[type] ? 0 : 1
  },

  rank(concept, computer) {
    return computer.ranks[concept.get("filename")].index
  },
  languageRank(concept, computer) {
    return computeds.isLanguage(concept) ? computer.languageRanks[concept.get("filename")].index : ""
  }
}

class MeasureComputer {
  constructor(scrollFile, concepts) {
    this.quickCache = {}
    this.concepts = concepts
    this.ranks = calcRanks(concepts, this, this.pageRankLinks)
    this.languageRanks = {}

    Object.values(this.ranks)
      .filter(obj => obj.isLanguage)
      .forEach((obj, index) => {
        const rank = { ...obj }
        rank.index = index + 1
        this.languageRanks[obj.filename] = rank
      })
  }

  get pageRankLinks() {
    if (this.quickCache.pageRankLinks) return this.quickCache.pageRankLinks

    this.quickCache.pageRankLinks = {}
    const pageRankLinks = this.quickCache.pageRankLinks
    this.concepts.forEach(concept => {
      pageRankLinks[concept.get("filename")] = []
    })

    this.concepts.forEach(concept => {
      const filename = concept.get("filename")
      concept
        .filter(node => node.isLinks)
        .forEach(node => {
          const links = node.content.split(" ")
          links.forEach(link => {
            link += ".scroll"
            if (!pageRankLinks[link]) throw new Error(`No file "${link}" found in "${filename}"`)

            pageRankLinks[link].push(filename)
          })
        })
    })

    return pageRankLinks
  }

  get(measureName, concept) {
    if (computeds[measureName]) {
      if (!concept[measureName]) concept[measureName] = computeds[measureName](concept, this)
      return concept[measureName]
    }
    return concept.get("appeared")
  }
}

const calcRanks = (concepts, computer, pageRankLinks) => {
  let objects = concepts.map(concept => {
    const filename = concept.get("filename")
    const object = {}
    object.filename = filename
    object.jobs = computer.get("numberOfJobsEstimate", concept)
    object.users = computer.get("numberOfUsersEstimate", concept)
    object.measurements = computer.get("measurements", concept)
    object.isLanguage = computeds.isLanguage(concept)
    object.pageRankLinks = pageRankLinks[filename].length
    return object
  })

  objects = rankSort(objects, "jobs")
  objects = rankSort(objects, "users")
  objects = rankSort(objects, "measurements")
  objects = rankSort(objects, "pageRankLinks")

  objects.forEach((obj, rank) => {
    // Drop the item this does the worst on, as it may be a flaw in PLDB.
    const top3 = [obj.jobsRank, obj.usersRank, obj.measurementsRank, obj.pageRankLinks]
    obj.totalRank = lodash.sum(lodash.sortBy(top3).slice(0, 3))
  })
  objects = lodash.sortBy(objects, ["totalRank"])

  const ranks = {}
  objects.forEach((obj, index) => {
    obj.index = index + 1
    ranks[obj.filename] = obj
  })
  return ranks
}

const rankSort = (objects, key) => {
  objects = lodash.sortBy(objects, [key])
  objects.reverse()
  let lastValue = objects[0][key]
  let lastRank = 0
  objects.forEach((obj, rank) => {
    const theValue = obj[key]
    if (lastValue === theValue) {
      // A tie
      obj[key + "Rank"] = lastRank
    } else {
      obj[key + "Rank"] = rank
      lastRank = rank
      lastValue = theValue
    }
  })
  return objects
}

module.exports = { MeasureComputer, Tables: new Tables() }
