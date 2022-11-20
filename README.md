# git-subdir-fetcher

本项目可用来拉取github仓库里的某个子目录

## 编译工具

> 需要nodejs环境

```
git clone git@github.com:lambertxiao/github-subdir-fetcher.git
cd github-subdir-fetcher && npm install && npm run build
``` 

如无意外，则在dst目录里会生成 `fetcher.js`

## 使用方式

```
Usage: fetcher.js download [options]

Options:
  -r, --repo <string>    git repo link
  -b, --branch <string>  git branch
  -d, --dir <string>     subdir in this repo you want to download
  -t, --retry <number>   retry times if download failed, default 3
  -o, --out <number>     download output dir
  -h, --help             display help for command
```

假设想要下载的内容如下：

- github仓库：`https://github.com/torvalds/linux`, 
- 期望下载的子目录：`fs`
- 期望写入的本地目录: `output`

则用以下参数执行工具

```
node dst/fetcher.js download -r torvalds/linux -d fs -o ./output
```
