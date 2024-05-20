#! /usr/bin/env node

const path = require("path")

const { TreeNode } = require("jtree/products/TreeNode.js")
const { Utils } = require("jtree/products/Utils.js")
const { Disk } = require("jtree/products/Disk.node.js")
const { ScrollSetCLI } = require("./ScrollSet.js")

const baseFolder = path.join(__dirname)
const ignoreFolder = path.join(baseFolder, "ignore")

class PLDBCli extends ScrollSetCLI {
  get keywordsOneHotCsv() {
    if (!this.quickCache.keywordsOneHotCsv) this.quickCache.keywordsOneHotCsv = new TreeNode(this.keywordsOneHot).asCsv
    return this.quickCache.keywordsOneHotCsv
  }

  conceptsFolder = path.join(baseFolder, "concepts")
  grammarFile = "code/measures.scroll"
  scrollSetName = "pldb"
  compiledConcepts = "./pldb.json"

  makeNames(concept) {
    return [
      concept.filename.replace(".scroll", ""),
      concept.id,
      concept.standsFor,
      concept.githubLanguage,
      concept.wikipediaTitle,
      concept.aka
    ].filter(i => i)
  }

  get keywordsOneHot() {
    if (this.quickCache.keywordsOneHot) return this.quickCache.keywordsOneHot
    const { keywordsTable } = this
    const allKeywords = keywordsTable.rows.map(row => row.keyword)
    const langsWithKeywords = this.topLanguages.filter(file => file.has("keywords"))
    const headerRow = allKeywords.slice()
    headerRow.unshift("id")
    const rows = langsWithKeywords.map(file => {
      const row = [file.id]
      const keywords = new Set(file.keywords)
      allKeywords.forEach(keyword => {
        row.push(keywords.has(keyword) ? 1 : 0)
      })
      return row
    })
    rows.unshift(headerRow)
    this.quickCache.keywordsOneHot = rows
    return rows
  }

  async crawlGitHubCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have measurementscrawlers project installed separateely.
    const { GitHubImporter } = require("../measurementscrawlers/github.com/GitHub.js")
    const importer = new GitHubImporter(this.concepts, this.conceptsFolder)
    await importer.fetchAllRepoDataCommand()
    await importer.writeAllRepoDataCommand()
  }

  async crawlRedditPLCommand() {
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have measurementscrawlers project installed separateely.
    const { RedditImporter } = require("../measurementscrawlers/reddit.com/Reddit.js")

    const importer = new RedditImporter(this.concepts, this.conceptsFolder)
    await importer.createFromAnnouncementsCommand()
  }

  async crawlGitsCommand() {
    const { GitStats } = require("./code/gitStats.js")
    // Todo: figuring out best repo orgnization for crawlers.
    // Note: this currently assumes you have measurementscrawlers project installed separateely.
    const gitsFolder = path.join(ignoreFolder, "node_modules", "gits") // toss in a fake "node_modules" folder to avoid a "scroll list" scan. hacky i know.
    this.concepts.forEach(async file => {
      const { mainRepo } = file
      if (!mainRepo) return
      const targetFolder = path.join(gitsFolder, file.filename.replace(".scroll", ""))
      //if (Disk.exists(targetFolder)) return
      if (file.repoStats_files) return
      if (file.isFinished) return
      try {
        const gitStats = new GitStats(mainRepo, targetFolder)
        if (!Disk.exists(targetFolder)) gitStats.clone()

        const targetPath = path.join(this.conceptsFolder, file.filename)
        const tree = new TreeNode(Disk.read(targetPath))
        tree.touchNode("repoStats").setProperties(gitStats.summary)
        if (!tree.has("appeared")) tree.set("appeared", gitStats.firstCommit.toString())
        Disk.write(targetPath, tree.toString())
      } catch (err) {
        console.error(err, file.id)
      }
    })
  }

  searchForConceptByFileExtensions(extensions = []) {
    const { extensionsMap } = this
    const hit = extensions.find(ext => extensionsMap.has(ext))
    return extensionsMap.get(hit)
  }

  get extensionsMap() {
    if (this.quickCache.extensionsMap) return this.quickCache.extensionsMap
    this.quickCache.extensionsMap = new Map()
    const extensionsMap = this.quickCache.extensionsMap
    this.concepts.forEach(concept => concept.extensions.split(" ").forEach(ext => extensionsMap.set(ext, concept.id)))

    return extensionsMap
  }
}

module.exports = { PLDBCli }

if (!module.parent) Utils.runCommand(new PLDBCli(), process.argv[2], process.argv[3])
