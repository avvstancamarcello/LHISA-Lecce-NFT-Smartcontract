// More precise brace validation
const fs = require('fs');

function findBraceIssue(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let braceCount = 0;
    let braceHistory = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        
        // Count opening braces
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (openBraces > 0 || closeBraces > 0) {
            braceCount += openBraces - closeBraces;
            braceHistory.push({
                line: lineNum,
                content: line.trim(),
                open: openBraces,
                close: closeBraces,
                balance: braceCount
            });
            
            // Show negative balance (more closes than opens)
            if (braceCount < 0) {
                console.log(`❌ Line ${lineNum}: Negative brace balance (${braceCount})`);
                console.log(`   ${line.trim()}`);
            }
        }
    }
    
    console.log(`\nFinal brace balance: ${braceCount}`);
    console.log('\nLast 10 brace-related lines:');
    braceHistory.slice(-10).forEach(entry => {
        console.log(`Line ${entry.line} (${entry.open} open, ${entry.close} close, balance: ${entry.balance}): ${entry.content}`);
    });
    
    return braceCount;
}

const contractPath = './contracts/LHISALecceNFT_flattened_manual.sol';
const balance = findBraceIssue(contractPath);