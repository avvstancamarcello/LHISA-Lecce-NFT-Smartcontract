// Simple script to validate Solidity syntax (basic check)
const fs = require('fs');

function validateSolidityBasicSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic syntax checks
        const lines = content.split('\n');
        let braceCount = 0;
        let errors = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            
            // Count braces
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            // Check for common syntax issues
            if (line.includes('function') && !line.includes('//') && !line.includes('*')) {
                if (!line.includes('(') || !line.includes(')')) {
                    errors.push(`Line ${lineNum}: Function missing parentheses`);
                }
            }
        }
        
        if (braceCount !== 0) {
            errors.push(`Brace mismatch: ${braceCount > 0 ? 'Missing closing' : 'Extra closing'} braces`);
        }
        
        console.log(`Validation Results for ${filePath}:`);
        console.log(`Total lines: ${lines.length}`);
        console.log(`Brace balance: ${braceCount === 0 ? 'OK' : 'UNBALANCED'}`);
        
        if (errors.length === 0) {
            console.log('✅ Basic syntax validation passed');
        } else {
            console.log('❌ Issues found:');
            errors.forEach(error => console.log(`  - ${error}`));
        }
        
        return errors.length === 0;
        
    } catch (error) {
        console.error('Error reading file:', error.message);
        return false;
    }
}

// Validate the main contract
const contractPath = './contracts/LHISALecceNFT_flattened_manual.sol';
const isValid = validateSolidityBasicSyntax(contractPath);

if (isValid) {
    console.log('\n✅ Contract appears to have valid basic syntax');
} else {
    console.log('\n❌ Contract has syntax issues that need to be fixed');
    process.exit(1);
}