const gcd=(a,b)=>{a=a<0n?-a:a;while(b){[a,b]=[b,a%b];}return a;};
export function rational(n,d=1n){n=BigInt(n);d=BigInt(d);if(!d)throw new Error('A denominator cannot be zero.');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
export const mul=(a,b)=>rational(a.n*b.n,a.d*b.d);
export const div=(a,b)=>rational(a.n*b.d,a.d*b.n);
export const sub=(a,b)=>rational(a.n*b.d-b.n*a.d,a.d*b.d);
export function parseAmount(value){
 if(typeof value!=='string'||value.length>32)throw new Error('Use a whole number, decimal, fraction, or mixed number.');
 const text=value.trim();let n,d=1n,m;
 if((m=/^(\d{1,7})\s+(\d{1,7})\/(\d{1,4})$/.exec(text))){d=BigInt(m[3]);n=BigInt(m[1])*d+BigInt(m[2]);}
 else if((m=/^(\d{1,7})\/(\d{1,4})$/.exec(text))){n=BigInt(m[1]);d=BigInt(m[2]);}
 else if((m=/^(\d{1,7})(?:\.(\d{1,3}))?$/.exec(text))){d=10n**BigInt((m[2]??'').length);n=BigInt(m[1])*d+BigInt(m[2]??'0');}
 else throw new Error('Use e.g. 2, 0.75, 1/3, or 1 1/2. No ranges or unit text.');
 if(d===0n||d>1000n)throw new Error('Use a denominator from 1 to 1,000.');
 const amount=rational(n,d);if(amount.n>1000000n*amount.d)throw new Error('Amounts must be at most 1,000,000.');
 return amount;
}
export function format(a){const negative=a.n<0n;let n=negative?-a.n:a.n;const whole=n/a.d,rest=n%a.d;return (negative?'-':'')+(rest?(whole?whole+' ':'')+rest+'/'+a.d:String(whole));}
export function rounded(a,denominator){
 if(![1,2,4,8,16].includes(denominator))throw new Error('Choose a supported measuring increment.');
 return rational((2n*a.n*BigInt(denominator)+a.d)/(2n*a.d),BigInt(denominator));
}
