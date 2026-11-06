/**
 * Используем Vite, уже установленный в проекте: он загружает TS без tsx/ts-node.
 * Запуск из корня проекта: node scripts/validate-demo-data.mjs
 */
import { createServer } from 'vite'

const vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
try {
  const {
    assertDemoDataValid, getValidationStats,
  } = await vite.ssrLoadModule('/src/data/demo/validate.ts')
  assertDemoDataValid()
  const stats = getValidationStats()
  console.log('OK: данные соответствуют согласованным полям DATA_MODEL.md v0.1')
  console.log(`Site: ${stats.sites}, Asset: ${stats.assets}, Measurement: ${stats.measurements}, Event: ${stats.events}`)
  console.log(`Отсутствующие значения (null): ${stats.missing}, настоящие нули: ${stats.zero}`)
  console.log(`Изолированные некорректные примеры обнаружены: ${stats.erroneousExamples}`)
  console.log(`Оценка качества по Site: ${JSON.stringify(stats.qualityBySite)}`)
} finally {
  await vite.close()
}
