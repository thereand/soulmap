const fs = require('fs')
const path = require('path')

const tsPath = path.join(__dirname, '../src/data/questions/soulmap-main.ts')
const jsPath = path.join(__dirname, 'questions-temp.js')
const jsonPath = path.join(__dirname, 'questions.json')

let content = fs.readFileSync(tsPath, 'utf-8')

// 移除 import 类型声明
content = content.replace(/^import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*\n?/m, '')

// 替换导出声明为 module.exports
content = content.replace(
  /export\s+const\s+soulmapMainQuestions\s*:\s*TestQuestion\[\]\s*=\s*\[/,
  'module.exports = ['
)

fs.writeFileSync(jsPath, content)

const questions = require(jsPath)
fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2))

console.log(`已生成 ${jsonPath}，共 ${questions.length} 道题目`)

// 清理临时文件
fs.unlinkSync(jsPath)
