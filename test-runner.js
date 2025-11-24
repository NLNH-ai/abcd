#!/usr/bin/env node

/**
 * Hanabi Band Website Test Runner
 * Simple Node.js test runner for automated testing
 */

const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            suites: []
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            error: '\x1b[31m',   // Red
            warning: '\x1b[33m', // Yellow
            reset: '\x1b[0m'     // Reset
        };

        const timestamp = new Date().toLocaleTimeString();
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async checkFileExists(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    async validateProjectStructure() {
        this.log('🔍 Validating project structure...', 'info');

        const requiredFiles = [
            'index.html',
            'manifest.json',
            'sw.js'
        ];

        const optionalFiles = [
            'images/앨범 표지 1.png',
            'images/윤태.png',
            'images/진호.png',
            'images/찬희.png',
            'videos/band-performance.mp4'
        ];

        let structureValid = true;

        // Check required files
        for (const file of requiredFiles) {
            const exists = await this.checkFileExists(file);
            if (exists) {
                this.log(`✅ Required file found: ${file}`, 'success');
                this.results.passed++;
            } else {
                this.log(`❌ Required file missing: ${file}`, 'error');
                this.results.failed++;
                structureValid = false;
            }
            this.results.total++;
        }

        // Check optional files
        for (const file of optionalFiles) {
            const exists = await this.checkFileExists(file);
            if (exists) {
                this.log(`✅ Optional file found: ${file}`, 'success');
            } else {
                this.log(`⚠️  Optional file missing: ${file}`, 'warning');
            }
        }

        return structureValid;
    }

    async validateHtmlStructure() {
        this.log('🔍 Validating HTML structure...', 'info');

        try {
            const htmlContent = await fs.promises.readFile('index.html', 'utf8');

            const tests = [
                {
                    name: 'DOCTYPE declaration',
                    test: () => htmlContent.includes('<!DOCTYPE html>'),
                    message: 'HTML5 DOCTYPE found'
                },
                {
                    name: 'Meta charset',
                    test: () => htmlContent.includes('charset="UTF-8"'),
                    message: 'UTF-8 charset declared'
                },
                {
                    name: 'Viewport meta tag',
                    test: () => htmlContent.includes('name="viewport"'),
                    message: 'Viewport meta tag present'
                },
                {
                    name: 'Title tag',
                    test: () => htmlContent.includes('<title>') && htmlContent.includes('</title>'),
                    message: 'Page title defined'
                },
                {
                    name: 'CSS custom properties',
                    test: () => htmlContent.includes('--color-primary'),
                    message: 'CSS custom properties implemented'
                },
                {
                    name: 'PWA manifest link',
                    test: () => htmlContent.includes('manifest.json'),
                    message: 'PWA manifest linked'
                },
                {
                    name: 'Service Worker registration',
                    test: () => htmlContent.includes('sw.js'),
                    message: 'Service Worker registered'
                },
                {
                    name: 'Error handling',
                    test: () => htmlContent.includes('try') && htmlContent.includes('catch'),
                    message: 'Error handling implemented'
                },
                {
                    name: 'State management',
                    test: () => htmlContent.includes('HanabiAppState'),
                    message: 'State management system found'
                }
            ];

            let htmlValid = true;

            for (const test of tests) {
                const passed = test.test();
                if (passed) {
                    this.log(`✅ ${test.name}: ${test.message}`, 'success');
                    this.results.passed++;
                } else {
                    this.log(`❌ ${test.name}: Missing or invalid`, 'error');
                    this.results.failed++;
                    htmlValid = false;
                }
                this.results.total++;
            }

            return htmlValid;
        } catch (error) {
            this.log(`❌ Error reading index.html: ${error.message}`, 'error');
            return false;
        }
    }

    async validateManifest() {
        this.log('🔍 Validating PWA manifest...', 'info');

        try {
            const manifestContent = await fs.promises.readFile('manifest.json', 'utf8');
            const manifest = JSON.parse(manifestContent);

            const tests = [
                {
                    name: 'Name field',
                    test: () => manifest.name && manifest.name.length > 0,
                    message: `App name: ${manifest.name}`
                },
                {
                    name: 'Short name',
                    test: () => manifest.short_name && manifest.short_name.length > 0,
                    message: `Short name: ${manifest.short_name}`
                },
                {
                    name: 'Display mode',
                    test: () => manifest.display === 'standalone',
                    message: `Display mode: ${manifest.display}`
                },
                {
                    name: 'Theme color',
                    test: () => manifest.theme_color && manifest.theme_color.startsWith('#'),
                    message: `Theme color: ${manifest.theme_color}`
                },
                {
                    name: 'Icons array',
                    test: () => Array.isArray(manifest.icons) && manifest.icons.length > 0,
                    message: `${manifest.icons?.length || 0} icons defined`
                },
                {
                    name: 'Start URL',
                    test: () => manifest.start_url && manifest.start_url.length > 0,
                    message: `Start URL: ${manifest.start_url}`
                }
            ];

            let manifestValid = true;

            for (const test of tests) {
                const passed = test.test();
                if (passed) {
                    this.log(`✅ ${test.name}: ${test.message}`, 'success');
                    this.results.passed++;
                } else {
                    this.log(`❌ ${test.name}: Invalid or missing`, 'error');
                    this.results.failed++;
                    manifestValid = false;
                }
                this.results.total++;
            }

            return manifestValid;
        } catch (error) {
            this.log(`❌ Error validating manifest: ${error.message}`, 'error');
            return false;
        }
    }

    async validateServiceWorker() {
        this.log('🔍 Validating Service Worker...', 'info');

        try {
            const swContent = await fs.promises.readFile('sw.js', 'utf8');

            const tests = [
                {
                    name: 'Cache names defined',
                    test: () => swContent.includes('CACHE_NAME'),
                    message: 'Cache names configured'
                },
                {
                    name: 'Install event listener',
                    test: () => swContent.includes("addEventListener('install'"),
                    message: 'Install event handler present'
                },
                {
                    name: 'Activate event listener',
                    test: () => swContent.includes("addEventListener('activate'"),
                    message: 'Activate event handler present'
                },
                {
                    name: 'Fetch event listener',
                    test: () => swContent.includes("addEventListener('fetch'"),
                    message: 'Fetch event handler present'
                },
                {
                    name: 'Cache strategies',
                    test: () => swContent.includes('cacheFirst') || swContent.includes('networkFirst'),
                    message: 'Caching strategies implemented'
                },
                {
                    name: 'Static assets list',
                    test: () => swContent.includes('STATIC_ASSETS'),
                    message: 'Static assets defined for caching'
                }
            ];

            let swValid = true;

            for (const test of tests) {
                const passed = test.test();
                if (passed) {
                    this.log(`✅ ${test.name}: ${test.message}`, 'success');
                    this.results.passed++;
                } else {
                    this.log(`❌ ${test.name}: Missing or invalid`, 'error');
                    this.results.failed++;
                    swValid = false;
                }
                this.results.total++;
            }

            return swValid;
        } catch (error) {
            this.log(`❌ Error validating service worker: ${error.message}`, 'error');
            return false;
        }
    }

    async runPerformanceChecks() {
        this.log('🔍 Running performance checks...', 'info');

        try {
            const htmlContent = await fs.promises.readFile('index.html', 'utf8');
            const htmlSize = Buffer.byteLength(htmlContent, 'utf8');

            const tests = [
                {
                    name: 'HTML file size',
                    test: () => htmlSize < 500000, // 500KB
                    message: `HTML size: ${(htmlSize / 1024).toFixed(2)} KB`,
                    warning: htmlSize > 300000 // Warn at 300KB
                },
                {
                    name: 'Inline styles optimization',
                    test: () => htmlContent.includes(':root') && htmlContent.includes('--color-'),
                    message: 'CSS custom properties used'
                },
                {
                    name: 'Image optimization hints',
                    test: () => htmlContent.includes('loading="lazy"') || htmlContent.includes('decoding="async"'),
                    message: 'Image optimization attributes found'
                },
                {
                    name: 'External dependency count',
                    test: () => {
                        const externalLinks = (htmlContent.match(/https?:\/\/[^"'\s]+/g) || []).length;
                        return externalLinks < 10;
                    },
                    message: `External dependencies: ${(htmlContent.match(/https?:\/\/[^"'\s]+/g) || []).length}`
                }
            ];

            for (const test of tests) {
                const passed = test.test();
                const logType = !passed ? 'error' : (test.warning && !test.test()) ? 'warning' : 'success';

                if (passed) {
                    this.log(`✅ ${test.name}: ${test.message}`, logType);
                    this.results.passed++;
                } else {
                    this.log(`${test.warning ? '⚠️' : '❌'} ${test.name}: ${test.message}`, logType);
                    if (!test.warning) {
                        this.results.failed++;
                    }
                }
                this.results.total++;
            }

        } catch (error) {
            this.log(`❌ Error in performance checks: ${error.message}`, 'error');
        }
    }

    async generateReport() {
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);

        this.log('\n📊 Test Summary', 'info');
        this.log('=' .repeat(50), 'info');
        this.log(`Total Tests: ${this.results.total}`, 'info');
        this.log(`Passed: ${this.results.passed}`, 'success');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
        this.log(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error');

        if (this.results.failed === 0) {
            this.log('\n🎉 All tests passed! Website is ready for deployment.', 'success');
        } else {
            this.log(`\n⚠️  ${this.results.failed} test(s) failed. Please review and fix the issues above.`, 'warning');
        }

        // Generate simple HTML report
        const reportHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hanabi Test Report</title>
    <style>
        body { font-family: 'Inter', sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        .metric.success { border-left: 4px solid #10B981; }
        .metric.error { border-left: 4px solid #EF4444; }
        .metric.warning { border-left: 4px solid #F59E0B; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎸 Hanabi Test Report</h1>
            <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="metric ${this.results.failed === 0 ? 'success' : 'error'}">
            <h3>Total Tests</h3>
            <div>${this.results.total}</div>
        </div>

        <div class="metric success">
            <h3>Passed</h3>
            <div>${this.results.passed}</div>
        </div>

        <div class="metric ${this.results.failed === 0 ? 'success' : 'error'}">
            <h3>Failed</h3>
            <div>${this.results.failed}</div>
        </div>

        <div class="metric ${passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error'}">
            <h3>Pass Rate</h3>
            <div>${passRate}%</div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>Status</h3>
            <p>${this.results.failed === 0 ?
                '🎉 All tests passed! Website is ready for deployment.' :
                `⚠️ ${this.results.failed} test(s) failed. Please review and fix the issues.`
            }</p>
        </div>
    </div>
</body>
</html>`;

        await fs.promises.writeFile('test-report.html', reportHtml);
        this.log('📄 Test report saved as test-report.html', 'info');
    }

    async run() {
        this.log('🚀 Starting Hanabi Website Test Suite', 'info');
        this.log('=' .repeat(50), 'info');

        const structureValid = await this.validateProjectStructure();
        if (structureValid) {
            await this.validateHtmlStructure();
            await this.validateManifest();
            await this.validateServiceWorker();
            await this.runPerformanceChecks();
        }

        await this.generateReport();

        // Exit with appropriate code
        process.exit(this.results.failed === 0 ? 0 : 1);
    }
}

// Run if called directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.run().catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;