# Security Policy

## Supported Versions
We maintain the smart contracts and deployment scripts in this repository. Please use the latest `main` branch or the tagged release you trust.

## Reporting a Vulnerability
- Please report security issues privately via email: security@dubaiproject.org
- Provide:
  - Contract address(es): `0xe9917a0a5978Dc11051DD674BbD7ceA55A1BA9B0`
  - Network: BNB Chain (BSC mainnet)
  - Steps to reproduce / proof-of-concept
  - Impact assessment and any suggested mitigations
- We aim to respond within 72 hours.

## Operational Practices
- Ownership: Token ownership will be transferred to a multisig (e.g., Gnosis Safe) after launch.
- Emergencies: `pause()` may be used to temporarily halt transfers in case of critical issues.
- Fee Model: A fixed, non-changeable 1% charity fee is built into the token.
- DEX Operations: Router/Pair addresses are fee-exempt to ensure smooth AMM operations; P2P transfers retain the 1% charity logic.

## Responsible Disclosure
We follow responsible disclosure best practices and appreciate coordinated vulnerability reports. We may offer recognition for valid issues at our discretion.
