import { SignatureReflection } from 'typedoc';
import { memberSymbol } from './member-symbol';
import { type } from './type';

export function signatureTitle(this: SignatureReflection) {
  const md = [];

  md.push(`${memberSymbol.call(this)} `);

  if (this.name === '__get') {
    md.push(`get **${this.parent.name}**`);
  } else if (this.name === '__set') {
    md.push(`set **${this.parent.name}**`);
  } else if (this.name !== '__call') {
    md.push(`**${this.name}**`);
  }

  if (this.typeParameters) {
    md.push(
      `\\<${this.typeParameters
        .map((typeParameter) => `**${typeParameter.name}**`)
        .join(', ')}>`,
    );
  }

  const params = this.parameters
    ? this.parameters
        .map((param) => {
          const paramsmd = [];
          if (param.flags.isRest) {
            paramsmd.push('...');
          }
          paramsmd.push(`\`${param.name}`);
          if (param.flags.isOptional) {
            paramsmd.push('?');
          }
          paramsmd.push(`\`: ${type.call(param.type, false)}`);
          return paramsmd.join('');
        })
        .join(', ')
    : '';
  md.push(`(${params})`);
  if (this.type) {
    md.push(`: ${type.call(this.type, false)}`);
  }
  return md.join('') + '\n';
}
