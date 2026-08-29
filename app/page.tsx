'use client';

import { useMemo, useState } from 'react';
import { BadgePoundSterling, Banknote, Building2, CheckCircle2, CircleAlert, HomeIcon, Landmark, RefreshCcw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PurchaseType = 'first' | 'main' | 'additional';
type RepaymentType = 'repayment' | 'interest';
const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const cny = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('zh-CN', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 });
const bands = [
  { lower: 0, upper: 125_000, standard: 0, additional: 0.05 },
  { lower: 125_000, upper: 250_000, standard: 0.02, additional: 0.07 },
  { lower: 250_000, upper: 925_000, standard: 0.05, additional: 0.1 },
  { lower: 925_000, upper: 1_500_000, standard: 0.1, additional: 0.15 },
  { lower: 1_500_000, upper: Number.POSITIVE_INFINITY, standard: 0.12, additional: 0.17 },
];

function calculateSdlt(price: number, resident: boolean, purchaseType: PurchaseType) {
  if (purchaseType === 'first' && price <= 500_000) return Math.max(0, price - 300_000) * 0.05 + (resident ? 0 : price * 0.02);
  return bands.reduce((sum, band) => {
    const taxable = Math.max(0, Math.min(price, band.upper) - band.lower);
    const baseRate = purchaseType === 'additional' ? band.additional : band.standard;
    return sum + taxable * (baseRate + (resident ? 0 : 0.02));
  }, 0);
}

function NumberField({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (value: number) => void; suffix?: string; step?: number }) {
  return <label className="field-row"><span>{label}</span><span className="input-shell"><Input type="number" value={Number.isFinite(value) ? value : 0} step={step} min={0} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />{suffix && <small>{suffix}</small>}</span></label>;
}

function Metric({ label, value, secondary, icon: Icon, featured = false }: { label: string; value: string; secondary?: string; icon: typeof HomeIcon; featured?: boolean }) {
  return <div className={`metric ${featured ? 'metric-featured' : ''}`}><div className="metric-icon"><Icon /></div><div><p>{label}</p><strong>{value}</strong>{secondary && <small>{secondary}</small>}</div></div>;
}

export default function Home() {
  const [project, setProject] = useState('Oval Village'); const [unit, setUnit] = useState('D1.4.4');
  const [area, setArea] = useState(764); const [originalPrice, setOriginalPrice] = useState(935_204.08);
  const [discount, setDiscount] = useState(2); const [exchangeRate, setExchangeRate] = useState(9.836);
  const [resident, setResident] = useState(true); const [purchaseType, setPurchaseType] = useState<PurchaseType>('main');
  const [loanRatio, setLoanRatio] = useState(50); const [interestRate, setInterestRate] = useState(4.85);
  const [loanYears, setLoanYears] = useState(30); const [repaymentType, setRepaymentType] = useState<RepaymentType>('repayment');
  const [deposit, setDeposit] = useState(5_000); const [legalFee, setLegalFee] = useState(3_000);
  const [otherFee, setOtherFee] = useState(1_000); const [registryFee, setRegistryFee] = useState(500);
  const [serviceRate, setServiceRate] = useState(6.5); const [groundRent, setGroundRent] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(3_243); const [managementRate, setManagementRate] = useState(12);
  const [payments, setPayments] = useState([10, 10, 5, 0, 0, 75]);

  const result = useMemo(() => {
    const price = Math.round(originalPrice * (1 - discount / 100)); const sdlt = Math.round(calculateSdlt(price, resident, purchaseType));
    const loan = Math.round(price * loanRatio / 100); const totalCost = price + sdlt + legalFee + otherFee + registryFee; const cashNeeded = totalCost - loan;
    const monthlyRate = interestRate / 100 / 12; const months = loanYears * 12;
    const monthlyMortgage = loan === 0 ? 0 : repaymentType === 'interest' ? loan * monthlyRate : monthlyRate === 0 ? loan / months : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    const annualRent = monthlyRent * 12; const operatingCosts = area * serviceRate + groundRent + annualRent * managementRate / 100;
    const noi = annualRent - operatingCosts; const annualDebt = monthlyMortgage * 12; const netCash = noi - annualDebt;
    return { price, sdlt, loan, totalCost, cashNeeded, monthlyMortgage, annualRent, noi, annualDebt, netCash, grossYield: price ? annualRent / price : 0, netYield: price ? noi / price : 0, cashReturn: cashNeeded ? netCash / cashNeeded : 0 };
  }, [area, discount, groundRent, interestRate, legalFee, loanRatio, loanYears, managementRate, monthlyRent, originalPrice, otherFee, purchaseType, registryFee, repaymentType, resident, serviceRate]);

  const paymentTotal = payments.reduce((sum, item) => sum + item, 0); const finalPayment = result.price * payments[5] / 100;
  const paymentOk = Math.abs(paymentTotal - 100) < 0.001; const loanOk = result.loan <= finalPayment;
  const reset = () => { setProject('Oval Village'); setUnit('D1.4.4'); setArea(764); setOriginalPrice(935_204.08); setDiscount(2); setExchangeRate(9.836); setResident(true); setPurchaseType('main'); setLoanRatio(50); setInterestRate(4.85); setLoanYears(30); setRepaymentType('repayment'); setDeposit(5_000); setLegalFee(3_000); setOtherFee(1_000); setRegistryFee(500); setServiceRate(6.5); setGroundRent(0); setMonthlyRent(3_243); setManagementRate(12); setPayments([10, 10, 5, 0, 0, 75]); };

  return <main>
    <header className="topbar"><div className="brand-mark"><Building2 /></div><div><p className="eyebrow">UK PROPERTY PLANNER</p><h1>英国买房测算工具</h1></div><Button variant="outline" onClick={reset}><RefreshCcw />恢复 Oval 示例</Button></header>
    <div className="page-shell">
      <section className="intro"><div><span className="status-pill">Oval 参考版 · 即时计算</span><h2>把房价、税费、贷款与租金<br />放进同一张决策图里</h2></div><p>修改左侧参数，结果与付款计划会即时更新。汇率口径为 <b>1 GBP = X CNY</b>。</p></section>
      <div className="workspace">
        <aside className="control-panel">
          <div className="panel-heading"><div><HomeIcon /><span>房产与买家</span></div><small>蓝色区域为输入项</small></div>
          <div className="field-grid">
            <label className="field-row"><span>项目名称</span><Input value={project} onChange={(e) => setProject(e.target.value)} /></label>
            <label className="field-row"><span>房号</span><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></label>
            <NumberField label="室内面积" value={area} onChange={setArea} suffix="ft²" /><NumberField label="房屋原价" value={originalPrice} onChange={setOriginalPrice} suffix="GBP" step={1000} />
            <NumberField label="折扣率" value={discount} onChange={setDiscount} suffix="%" step={0.1} /><NumberField label="英镑兑人民币" value={exchangeRate} onChange={setExchangeRate} suffix="CNY" step={0.001} />
            <label className="field-row"><span>UK Resident</span><Select value={resident ? 'yes' : 'no'} onValueChange={(v) => setResident(v === 'yes')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">是</SelectItem><SelectItem value="no">否</SelectItem></SelectContent></Select></label>
            <label className="field-row"><span>购房性质</span><Select value={purchaseType} onValueChange={(v) => setPurchaseType(v as PurchaseType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="first">首套（符合优惠）</SelectItem><SelectItem value="main">唯一住房 / 置换</SelectItem><SelectItem value="additional">额外住房 / 投资房</SelectItem></SelectContent></Select></label>
          </div>
          <div className="subheading"><Landmark />贷款参数</div><div className="field-grid"><NumberField label="贷款比例" value={loanRatio} onChange={setLoanRatio} suffix="%" /><NumberField label="年利率" value={interestRate} onChange={setInterestRate} suffix="%" step={0.05} /><NumberField label="贷款年限" value={loanYears} onChange={setLoanYears} suffix="年" /><label className="field-row"><span>还款方式</span><Select value={repaymentType} onValueChange={(v) => setRepaymentType(v as RepaymentType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="repayment">本息同还</SelectItem><SelectItem value="interest">只还利息</SelectItem></SelectContent></Select></label></div>
        </aside>
        <section className="results-panel">
          <div className="results-head"><div><p className="eyebrow">LIVE ESTIMATE</p><h3>{project || '未命名项目'} · {unit || '未填写房号'}</h3></div><span>{currency.format(result.price)}</span></div>
          <div className="metric-grid"><Metric label="购房总成本" value={currency.format(result.totalCost)} secondary={cny.format(result.totalCost * exchangeRate)} icon={BadgePoundSterling} featured /><Metric label="需投入现金" value={currency.format(result.cashNeeded)} secondary={cny.format(result.cashNeeded * exchangeRate)} icon={Banknote} featured /><Metric label="印花税 SDLT" value={currency.format(result.sdlt)} secondary={purchaseType === 'first' && result.price <= 500000 ? '首套优惠口径' : '现行住宅税率'} icon={Landmark} /><Metric label="预计月供" value={currency.format(result.monthlyMortgage)} secondary={repaymentType === 'repayment' ? '本息同还' : '只还利息'} icon={HomeIcon} /><Metric label="净租金回报率" value={percent.format(result.netYield)} secondary={`毛回报 ${percent.format(result.grossYield)}`} icon={TrendingUp} /><Metric label="税前年净现金流" value={currency.format(result.netCash)} secondary={`现金回报 ${percent.format(result.cashReturn)}`} icon={Banknote} /></div>
          <div className="cashflow-strip"><div><span>年度租金</span><b>{currency.format(result.annualRent)}</b></div><i>−</i><div><span>运营成本</span><b>{currency.format(result.annualRent - result.noi)}</b></div><i>−</i><div><span>年度房贷</span><b>{currency.format(result.annualDebt)}</b></div><i>=</i><div className={result.netCash >= 0 ? 'positive' : 'negative'}><span>净现金流</span><b>{currency.format(result.netCash)}</b></div></div>
        </section>
      </div>
      <section className="detail-grid">
        <div className="detail-card"><div className="detail-title"><span><Banknote />费用与租赁假设</span><small>影响成本与净收益</small></div><div className="compact-fields"><NumberField label="预定金" value={deposit} onChange={setDeposit} suffix="GBP" /><NumberField label="律师费及 VAT" value={legalFee} onChange={setLegalFee} suffix="GBP" /><NumberField label="其他杂费" value={otherFee} onChange={setOtherFee} suffix="GBP" /><NumberField label="土地注册费" value={registryFee} onChange={setRegistryFee} suffix="GBP" /><NumberField label="物业费" value={serviceRate} onChange={setServiceRate} suffix="GBP/ft²/年" step={0.1} /><NumberField label="地租" value={groundRent} onChange={setGroundRent} suffix="GBP/年" /><NumberField label="预计月租" value={monthlyRent} onChange={setMonthlyRent} suffix="GBP" /><NumberField label="租赁管理费" value={managementRate} onChange={setManagementRate} suffix="%" step={0.5} /></div></div>
        <div className="detail-card payment-card"><div className="detail-title"><span><Landmark />付款计划</span><small>贷款默认在尾款抵扣</small></div><div className="check-row"><span className={paymentOk ? 'check-ok' : 'check-bad'}>{paymentOk ? <CheckCircle2 /> : <CircleAlert />}比例合计 {paymentTotal.toFixed(1)}%</span><span className={loanOk ? 'check-ok' : 'check-bad'}>{loanOk ? <CheckCircle2 /> : <CircleAlert />}{loanOk ? '贷款可在尾款抵扣' : '贷款超过尾款'}</span></div><div className="payment-table"><div className="payment-row header"><span>阶段</span><span>比例</span><span>现金支付</span><span>人民币参考</span></div><div className="payment-row"><span>预定金</span><span>—</span><b>{currency.format(deposit)}</b><small>{cny.format(deposit * exchangeRate)}</small></div>{payments.map((ratio, index) => { const due = result.price * ratio / 100; const loanApplied = index === 5 ? Math.min(result.loan, due) : 0; const cash = Math.max(0, due - loanApplied - (index === 0 ? deposit : 0)); return <div className="payment-row" key={index}><span>{index === 5 ? '尾款' : `第 ${index + 1} 笔`}</span><span className="ratio-input"><Input type="number" min={0} value={ratio} onChange={(e) => setPayments((current) => current.map((item, i) => i === index ? Number(e.target.value) : item))} /><small>%</small></span><b>{currency.format(cash)}</b><small>{cny.format(cash * exchangeRate)}</small></div>; })}</div></div>
      </section>
      <footer><p>用于初步比较，不构成税务、法律、贷款或投资建议。复杂交易请由英国律师、税务师及贷款顾问复核。</p><a href="https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances" target="_blank" rel="noreferrer">HMRC 税率来源</a></footer>
    </div>
  </main>;
}
