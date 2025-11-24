# 🧪 하나비 Website Testing Guide

This document explains the testing infrastructure for the Hanabi band website.

## Testing Overview

The website includes multiple testing approaches:

### 1. Automated Node.js Tests (`npm test`)
- **File validation**: Checks for required files and project structure
- **HTML validation**: Validates HTML structure, meta tags, and modern features
- **PWA validation**: Tests manifest.json and service worker implementation
- **Performance checks**: Basic performance and optimization validation

```bash
# Run all automated tests
npm test

# Or run directly
node test-runner.js
```

### 2. Interactive Browser Tests (`test.html`)
- **Unit tests**: JavaScript function testing
- **Performance tests**: Real-time performance metrics
- **Accessibility tests**: WCAG compliance checks
- **Visual regression tests**: CSS and layout validation

```bash
# Open interactive test suite
npm run test:browser
# Then manually open test.html in your browser
```

## Test Categories

### 🔧 Unit Tests
- DOM manipulation functions
- Animation and effects validation
- CSS custom properties verification
- Modern JavaScript features

### ⚡ Performance Tests
- Page load time measurement
- Memory usage monitoring
- Animation performance validation
- Resource loading optimization

### ♿ Accessibility Tests
- Meta tag validation
- Image alt attribute checks
- Heading hierarchy verification
- Color contrast analysis
- Focus management validation

### 👁️ Visual Tests
- CSS loading verification
- Responsive design validation
- Image loading status
- Animation support detection

## Running Tests

### Command Line Tests
```bash
# Install dependencies (if any)
npm install

# Run automated validation
npm test

# Generate test report
npm run validate
```

### Browser Tests
1. Open `test.html` in your browser
2. Click "Run All Tests" or individual test categories
3. Review results in the test interface

## Test Results

### Automated Tests
- Console output with color-coded results
- `test-report.html` generated with detailed metrics
- Exit codes: 0 (success), 1 (failures)

### Browser Tests
- Real-time visual feedback
- Interactive test execution
- Performance metrics display
- Accessibility compliance status

## Adding New Tests

### Node.js Tests (test-runner.js)
```javascript
// Add to appropriate validation function
const tests = [
    {
        name: 'Your test name',
        test: () => /* your test logic */,
        message: 'Success/failure message'
    }
];
```

### Browser Tests (test.html)
```javascript
// Add to testFramework
testFramework.describe('Test Suite Name', () => {
    testFramework.test('Test case name', () => {
        // Your test logic
        return testFramework.expect(actual).toBe(expected);
    });
});
```

## Continuous Integration

For automated testing in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm test
    # Check exit code for pass/fail
```

## Test Configuration

### Performance Thresholds
- HTML file size: < 500KB (warning at 300KB)
- Page load time: < 3000ms
- DOM content loaded: < 1000ms
- Memory usage: < 50MB

### Accessibility Standards
- WCAG 2.1 AA compliance
- Proper heading hierarchy
- Alt attributes for images
- Color contrast validation
- Focus management

## Troubleshooting

### Common Issues

1. **Test file not found**
   - Ensure you're running tests from project root
   - Check file paths in test configuration

2. **Performance tests failing**
   - Clear browser cache
   - Close other applications
   - Test on different devices

3. **Accessibility tests failing**
   - Review HTML semantics
   - Add missing alt attributes
   - Fix heading hierarchy

### Debug Mode
Add console logging in test files for detailed debugging:

```javascript
console.log('Debug: Testing feature X');
```

## Best Practices

1. **Run tests frequently** during development
2. **Fix failing tests immediately** to maintain quality
3. **Add tests for new features** to prevent regressions
4. **Review performance metrics** regularly
5. **Test on multiple browsers** for compatibility

## Test Coverage

Current test coverage includes:
- ✅ Project structure validation
- ✅ HTML/CSS/JavaScript validation
- ✅ PWA implementation
- ✅ Performance monitoring
- ✅ Accessibility compliance
- ✅ Visual regression basics

Future improvements:
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing
- [ ] Load testing
- [ ] Security testing
- [ ] SEO validation