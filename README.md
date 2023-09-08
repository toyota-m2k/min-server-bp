# Node + Express + TypeScript --> ミニマム構成サーバ

以前、[Nodeで multi-cluster サーバーを構成するための雛形](https://github.com/toyota-m2k/server-bp)を作成したが、ちょっとした実験用サーバーを作るには大掛かり過ぎて使えない。
ちょっと作って捨てる実験用サーバーの雛形として、こちらを作成。

## インストールと実行

### 単体実行
```
npm install
npm run build
npm start
```

### 変更監視＆自動ビルド付きで開始
```
npm run mon
```

### 変更監視＆ビルド
```
npm run build-w
```

### WebStorm でのデバッグ
- Configuration Type: npm
- Command: run
- Script: dev

## 作り方（こうやって作った）
```
mkdir <project-dir>
cd <project-dir>
mkdir src
mkdir dist
npm init -y
npm i express
npm i -D typescript @type/node @types/express
npm i -D ts-node		// tsファイルをコンパイルしないで直接実行する
npm i -D tsc-watch		// tsファイルの変更を監視して自動的にコンパイル＆再起動 (tsc -w の拡張) ... もう使わないと思う。
npm i -D nodemon		// 変更を監視してプロセスを再起動
npx tsc --init
```

### tcsconfig.json

```json
    {
  "compilerOptions": {
    // 追加|変更したもの
    "target": "esnext",    /* default: es2016 */
    "module": "esnext",    /* default: commonjs */
    "outDir": "./dist",    /* Specify an output folder for all emitted files. */

    // デフォルトのまま
    "esModuleInterop": true, 
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  // 以下追加
  "include": [
    "./src/**/*"
  ],
  "exclude": [
    "node-modules",
    "**/*.spec.ts"
  ],
  "ts-node": {
    "esm": true    /* ts-node で、 type=module に対応するために必要 */
  }
}
```

### packages.json
変更箇所だけ抜粋
```json
{
  "script": {
    "start": "node ./dist/index.js",
    "build": "tsc",
    "build-w": "tsc -w",
    "mon": "nodemon src/index.ts",
    "dev": "nodemon --exec \"node --inspect --loader ts-node/esm --require ts-node/register src/index.ts\""
  },
  "type": "module",   // ts を使うなら moduleやろ。。。知らんけど
  "nodemonConfig": {  // nodemon を使うための定義 (nodemon.jsonに書いても可）
    "watch": [
      "./src"
    ],
    "ext": "ts",
    "execMap": {
      "ts": "ts-node"
    }
  }
}
```

### src/index.ts
とりあえず動くやつ
```ts
	import express from 'express';
	import type { Express, Request, Response } from 'express';
	const app: Express = express();
	const port = 3001;
	app.get('/', (req: Request, res: Response) => res.send('Hello World!'));
	app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

### 補足
node + ts-node で実行するため、`--require ts-node/register` オプションを付けて、
```
node --inspect --require ts-node/register src/index.ts
```
とすると、
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for C:\dev\service\rtc\server\src\index.ts
```
のエラーが出る。[ググったら](https://stackoverflow.com/questions/62096269/cant-run-my-node-js-typescript-project-typeerror-err-unknown-file-extension)、package.json の　`"type": "module"` を削除しろ、と言われた。これを削除すると、*.ts 中の `import` がエラーになってしまうので困る。
で、削除したくない人は、`--loader ts-node/esm` オプションを付けて、`tsconfig.json` の `ts-node` セクションに、`"esm":true` を書け、と言われているので、その通りやったら、
` ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time`という警告は出るが、実行＆デバッグできた。
`--experimental-specifier-resolution=node` も付けるように書かれていたが、こいつは意味が分からないので無視してやったぜ。
あとで調べてみたら、これは、some.ts を `import * from "some"`でインポートできるように、拡張子(ts)を補完するオプションなのだとか。名前から働きを想像できないのは僕だけ？

