import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { program } from "commander"

let repo_raw_url = ""
let repo_url = ""
let output_dir = ""
let retry_times = 3

async function get_request(url: string) {
  let retData: any
  for (let i = 0; i < retry_times; i++) {
    try {
      let rsp = await axios.get(url)
      retData = rsp.data

      if ((Math.round(rsp.status / 100)) == 2) {
        return rsp.data
      }
    } catch (error) {
      console.log("retry: ", url)
    }
  }

  return retData
}

async function request_page(url: string, prefix: string) {
  await parseContent(await get_request(url + "/" + prefix), prefix)
}

async function parseContent(content: string, prefix: string) {
  const $ = cheerio.load(content);
  let titles: string[] = [];
  let childs = $(".js-details-container .Box-row div[role=rowheader]")

  let local_path = output_dir + "/" + prefix

  if (childs.length == 0) {
    console.log(`download file: ${prefix}`)

    if (fs.existsSync(local_path)) {
      console.log(`file exist: ${prefix}`)
    } else {
      let resp = await get_request(repo_raw_url + "/" + prefix)
      fs.writeFileSync(local_path, resp)
    }

  } else {
    console.log(`find dir: ${prefix}`)
    fs.mkdirSync(local_path, { recursive: true })

    // is dir
    childs.each((i, ele) => {
      let title = $(ele).find('a').text().trim();
      titles.push(title)
    })

    for (let title of titles) {
      if (title == ". .") {
        continue
      }
      await request_page(repo_url, prefix + "/" + title)
    }
  }
}

async function download(opts: any) {
  let repo = opts.repo
  if (!repo) {
    console.log("repo is required")
    return
  }

  let branch = opts.branch
  if (!branch) {
    branch = "master"
  }

  output_dir = opts.out
  if (!output_dir) {
    output_dir = "./"
  }

  fs.mkdirSync(output_dir, {recursive: true})

  repo_url = `https://github.com/${repo}/tree/${branch}`
  repo_raw_url = `https://raw.githubusercontent.com/${repo}/${branch}`

  console.log("repo_url: ", repo_url)
  console.log("repo_raw_url: ", repo_raw_url)
  console.log("output_dir: ", output_dir)

  await request_page(repo_url, opts.dir)
}

async function main() {
  program
    .name('fetcher.js')
    .description('the tool is used to download the subdir in github repo')
    .version('0.0.1');

  program.command('download')
    .option('-r, --repo <string>', 'git repo link')
    .option('-b, --branch <string>', 'git branch')
    .option('-d, --dir <string>', 'subdir in this repo you want to download')
    .option('-t, --retry <number>', 'retry times if download failed, default 3')
    .option('-o, --out <number>', 'download output dir')
    .action((opts) => {
      download(opts)
    });

  program.parse(process.argv)
}

main()
