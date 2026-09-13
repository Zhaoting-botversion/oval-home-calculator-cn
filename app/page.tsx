'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { BadgePoundSterling, Banknote, Building2, CheckCircle2, CircleAlert, FileDown, HomeIcon, Landmark, RefreshCcw, TrendingUp } from 'lucide-react';
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

function Metric({ label, value, secondary, icon: Icon, featured = false }: { label: string; value: string; secondary?: ReactNode; icon: typeof HomeIcon; featured?: boolean }) {
  return <div className={`metric ${featured ? 'metric-featured' : ''}`}><div className="metric-icon"><Icon /></div><div><p>{label}</p><strong>{value}</strong>{secondary && <small>{secondary}</small>}</div></div>;
}

function GrowthScenarios({ price, totalCost, noi, exchangeRate }: { price: number; totalCost: number; noi: number; exchangeRate: number }) {
  return <section className="growth-scenarios"><h3>房价涨跌情景 <small>One-year price scenarios</small></h3><p>一年期假设分析 · 不含贷款影响 · 非市场预测</p><div className="growth-scroll"><table><thead><tr><th scope="col">房价年变化</th><th scope="col">一年后房价 GBP</th><th scope="col">房价变化 GBP / CNY</th><th scope="col">综合收益 GBP</th><th scope="col">综合回报率</th></tr></thead><tbody>{[-5, 0, 2, 5, 7].map(rate => {
    const change = price * rate / 100;
    const combined = noi + change;
    const valid = Number.isFinite(totalCost) && totalCost > 0 && Number.isFinite(combined);
    return <tr key={rate} className={rate === 0 ? 'growth-baseline' : ''}><th scope="row">{rate > 0 ? '+' : ''}{rate}%{rate === 0 && <small>房价不变</small>}</th><td>{currency.format(price + change)}</td><td>{currency.format(change)}<small>{cny.format(change * exchangeRate)}</small></td><td>{currency.format(combined)}</td><td className={combined < 0 ? 'growth-loss' : ''}>{valid ? percent.format(combined / totalCost) : '不适用'}</td></tr>;
  })}</tbody></table></div><div className="growth-notes"><p>房价变化金额 = 折后房款 × 假设涨跌幅；综合收益 = 年度净经营收益 NOI + 房价变化金额；综合回报率 = 综合收益 ÷ 购房总支出。</p><p>以上均为税前、融资前的假设值，不是现金回报率或出售后的实际收益。账面增值不计入年度净现金流；未扣除贷款利息、出售费用、相关税费及其他未纳入模型的费用。假设持有满一年、租金和运营成本不变、汇率不变；房价可能下跌，实际结果可能不同。</p></div></section>;
}

type OverviewGroup = { label: string; english: string; rows: { label: string; value: number | string; highlight?: boolean }[] };
function CostOverview({ groups, exchangeRate }: { groups: OverviewGroup[]; exchangeRate: number }) {
  return <table className="overview-table"><colgroup><col className="overview-category" /><col /><col className="overview-amount" /><col className="overview-amount" /></colgroup><thead><tr><th>分类</th><th>资金项目 / Cost breakdown</th><th>英镑 GBP</th><th>人民币 CNY</th></tr></thead>{groups.map(group => <tbody key={group.label}>{group.rows.map((row, index) => <tr key={row.label} className={row.highlight ? 'overview-highlight' : ''}>{index === 0 && <th scope="rowgroup" rowSpan={group.rows.length} className="overview-group">{group.label}<small>{group.english}</small></th>}<th scope="row">{row.label}</th>{typeof row.value === 'number' ? <><td>{currency.format(row.value)}</td><td>{cny.format(row.value * exchangeRate)}</td></> : <td colSpan={2} className="overview-text">{row.value}</td>}</tr>)}</tbody>)}</table>;
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
  const serviceCharge = area * serviceRate;
  const managementFee = result.annualRent * managementRate / 100;
  const operatingCosts = serviceCharge + groundRent + managementFee;
  const purchaseTypeLabel = purchaseType === 'first' ? '首套（符合优惠）' : purchaseType === 'additional' ? '额外住房 / 投资房' : '唯一住房 / 置换';
  const repaymentTypeLabel = repaymentType === 'interest' ? '只还利息' : '等额本息';
  const paymentDetails = payments.map((ratio, index) => { const due = result.price * ratio / 100; const loanApplied = index === 5 ? Math.min(result.loan, due) : 0; const cash = Math.max(0, due - loanApplied - (index === 0 ? deposit : 0)); return { label: index === 5 ? '尾款' : `第 ${index + 1} 笔`, ratio, due, loanApplied, cash }; });
  const paymentCashTotal = deposit + paymentDetails.reduce((sum, item) => sum + item.cash, 0);
  const fundingOk = Math.abs(paymentCashTotal + result.loan - result.price) < 1;
  const overviewGroups: OverviewGroup[] = [
    { label: '房产信息', english: 'Property information', rows: [
      { label: '项目 / 房号', value: `${project || '未填写'} · ${unit || '未填写'}` },
      { label: '套内面积', value: `${area.toLocaleString()} ft² / ${(area * 0.09290304).toFixed(1)} m²` },
      { label: '买家身份 / 购房性质', value: `${resident ? '英国居民' : '非英国居民'} · ${purchaseTypeLabel}` },
      { label: '房屋原价', value: originalPrice },
      { label: `折后房款（折扣 ${discount}%）`, value: result.price, highlight: true },
    ] },
    { label: '付款与融资', english: 'Payment & finance', rows: [
      { label: '预定金（包含在房款内）', value: deposit },
      { label: '首笔房款现金（已扣预定金）', value: paymentDetails[0].cash },
      { label: '中间四笔房款现金合计', value: paymentDetails.slice(1, 5).reduce((sum, row) => sum + row.cash, 0) },
      { label: '尾款现金（已扣可抵贷款）', value: paymentDetails[5].cash },
      { label: `贷款金额（${loanRatio}% · ${interestRate}% · ${loanYears}年）`, value: result.loan },
    ] },
    { label: '购房一次性费用', english: 'One-off costs', rows: [
      { label: '印花税 SDLT', value: result.sdlt },
      { label: '律师费及 VAT', value: legalFee },
      { label: '其他杂费 / 土地注册费', value: otherFee + registryFee },
      { label: '其他款项合计（不含房款）', value: result.totalCost - result.price, highlight: true },
      { label: '购房总支出（房款 + 其他款项）', value: result.totalCost, highlight: true },
      { label: '需投入现金（总支出 − 贷款）', value: result.cashNeeded, highlight: true },
    ] },
    { label: '出租持有费用', english: 'Annual running costs', rows: [
      { label: `物业费 / 年（£${serviceRate} / ft²）`, value: serviceCharge },
      { label: '地租 / 年', value: groundRent },
      { label: `租赁管理费 / 年（年租金的 ${managementRate}%）`, value: managementFee },
      { label: '年度运营成本合计', value: operatingCosts, highlight: true },
    ] },
    { label: '租金与现金流', english: 'Rental & cash flow', rows: [
      { label: '预计周租（年租金 ÷ 52）', value: result.annualRent / 52 },
      { label: '预计月租', value: monthlyRent },
      { label: '预计年租金（月租 × 12）', value: result.annualRent },
      { label: '净经营收益 NOI / 年（偿债前）', value: result.noi, highlight: true },
      { label: '年度偿债（月供 × 12）', value: result.annualDebt },
      { label: '税前年净现金流（NOI − 年度偿债）', value: result.netCash, highlight: true },
    ] },
    { label: '收益口径', english: 'Return measures', rows: [
      { label: '净经营回报率（NOI ÷ 购房总支出）', value: percent.format(result.totalCost ? result.noi / result.totalCost : 0) },
      { label: '租金净回报率（NOI ÷ 折后房款）', value: percent.format(result.netYield) },
      { label: '现金回报率（净现金流 ÷ 投入现金）', value: percent.format(result.cashReturn) },
    ] },
  ];
  const reset = () => { setProject('Oval Village'); setUnit('D1.4.4'); setArea(764); setOriginalPrice(935_204.08); setDiscount(2); setExchangeRate(9.836); setResident(true); setPurchaseType('main'); setLoanRatio(50); setInterestRate(4.85); setLoanYears(30); setRepaymentType('repayment'); setDeposit(5_000); setLegalFee(3_000); setOtherFee(1_000); setRegistryFee(500); setServiceRate(6.5); setGroundRent(0); setMonthlyRent(3_243); setManagementRate(12); setPayments([10, 10, 5, 0, 0, 75]); };

  return <main>
    <header className="topbar"><div className="brand-mark"><Building2 /></div><div><p className="eyebrow">UK PROPERTY PLANNER</p><h1>英国买房测算工具</h1></div><div className="top-actions"><Button variant="outline" onClick={() => window.print()}><FileDown />导出 PDF</Button><Button variant="outline" onClick={reset}><RefreshCcw />恢复 Oval 示例</Button></div></header>
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
          <div className="metric-grid"><Metric label="购房总成本" value={currency.format(result.totalCost)} secondary={<span className="cost-breakdown"><span>房款 <b>{currency.format(result.price)}</b></span><span>其他款项合计 <b>{currency.format(result.totalCost - result.price)}</b></span></span>} icon={BadgePoundSterling} featured /><Metric label="需投入现金" value={currency.format(result.cashNeeded)} secondary={cny.format(result.cashNeeded * exchangeRate)} icon={Banknote} featured /><Metric label="印花税 SDLT" value={currency.format(result.sdlt)} secondary={purchaseType === 'first' && result.price <= 500000 ? '首套优惠口径' : '现行住宅税率'} icon={Landmark} /><Metric label="预计月供" value={currency.format(result.monthlyMortgage)} secondary={repaymentType === 'repayment' ? '本息同还' : '只还利息'} icon={HomeIcon} /><Metric label="净租金回报率" value={percent.format(result.netYield)} secondary={`毛回报 ${percent.format(result.grossYield)}`} icon={TrendingUp} /><Metric label="税前年净现金流" value={currency.format(result.netCash)} secondary={`现金回报 ${percent.format(result.cashReturn)}`} icon={Banknote} /></div>
          <div className="cashflow-strip"><div><span>年度租金</span><b>{currency.format(result.annualRent)}</b></div><i>−</i><div><span>运营成本</span><b>{currency.format(result.annualRent - result.noi)}</b></div><i>−</i><div><span>年度房贷</span><b>{currency.format(result.annualDebt)}</b></div><i>=</i><div className={result.netCash >= 0 ? 'positive' : 'negative'}><span>净现金流</span><b>{currency.format(result.netCash)}</b></div></div>
        </section>
      </div>
      <section className="detail-grid">
        <div className="detail-card"><div className="detail-title"><span><Banknote />费用假设</span><small>一次性费用与持有成本</small></div><div className="compact-fields"><NumberField label="预定金" value={deposit} onChange={setDeposit} suffix="GBP" /><NumberField label="律师费及 VAT" value={legalFee} onChange={setLegalFee} suffix="GBP" /><NumberField label="其他杂费" value={otherFee} onChange={setOtherFee} suffix="GBP" /><NumberField label="土地注册费" value={registryFee} onChange={setRegistryFee} suffix="GBP" /><NumberField label="物业费" value={serviceRate} onChange={setServiceRate} suffix="GBP/ft²/年" step={0.1} /><NumberField label="地租" value={groundRent} onChange={setGroundRent} suffix="GBP/年" /></div><div className="reference-rate"><div><b>25 Cuba Street 参考物业费</b><small>约 £7.50 / ft² / 年</small></div><Button type="button" variant="outline" size="sm" onClick={() => setServiceRate(7.5)}>{Math.abs(serviceRate - 7.5) < 0.001 ? '已套用' : '一键套用'}</Button></div></div>
        <div className="detail-card rent-card"><div className="detail-title"><span><TrendingUp />租金与收益假设</span><small>可按月租或目标毛回报设置</small></div><div className="rent-fields"><NumberField label="预计月租金" value={monthlyRent} onChange={setMonthlyRent} suffix="GBP/月" step={50} /><NumberField label="目标毛租金回报率" value={Number((result.grossYield * 100).toFixed(2))} onChange={(value) => setMonthlyRent(result.price > 0 ? Math.round(result.price * value / 100 / 12) : 0)} suffix="%" step={0.1} /><NumberField label="租赁管理费" value={managementRate} onChange={setManagementRate} suffix="年租金 %" step={0.5} /></div><div className="rent-summary"><div><span>预计周租</span><b>{currency.format(result.annualRent / 52)}</b></div><div><span>预计年租金</span><b>{currency.format(result.annualRent)}</b></div><div><span>当前净回报率</span><b>{percent.format(result.netYield)}</b></div></div><p className="rent-help">修改月租金会自动更新毛回报率；修改目标毛回报率则会反算月租金。净回报率会同时扣除物业费、地租及租赁管理费。</p></div>
        <div className="detail-card payment-card"><div className="detail-title"><span><Landmark />付款计划</span><small>贷款默认在尾款抵扣</small></div><div className="check-row"><span className={paymentOk ? 'check-ok' : 'check-bad'}>{paymentOk ? <CheckCircle2 /> : <CircleAlert />}比例合计 {paymentTotal.toFixed(1)}%</span><span className={loanOk ? 'check-ok' : 'check-bad'}>{loanOk ? <CheckCircle2 /> : <CircleAlert />}{loanOk ? '贷款可在尾款抵扣' : '贷款超过尾款'}</span></div><div className="payment-table"><div className="payment-row header"><span>阶段</span><span>比例</span><span>现金支付</span><span>人民币参考</span></div><div className="payment-row"><span>预定金</span><span>—</span><b>{currency.format(deposit)}</b><small>{cny.format(deposit * exchangeRate)}</small></div>{payments.map((ratio, index) => { const due = result.price * ratio / 100; const loanApplied = index === 5 ? Math.min(result.loan, due) : 0; const cash = Math.max(0, due - loanApplied - (index === 0 ? deposit : 0)); return <div className="payment-row" key={index}><span>{index === 5 ? '尾款' : `第 ${index + 1} 笔`}</span><span className="ratio-input"><Input type="number" min={0} value={ratio} onChange={(e) => setPayments((current) => current.map((item, i) => i === index ? Number(e.target.value) : item))} /><small>%</small></span><b>{currency.format(cash)}</b><small>{cny.format(cash * exchangeRate)}</small></div>; })}</div></div>
      </section>
      <details className="overview-preview"><summary>查看资金分解总览 <span>Cost Breakdown · 与 PDF 首页同步</span></summary><div className="overview-scroll"><CostOverview groups={overviewGroups} exchangeRate={exchangeRate} /></div><p>预定金抵扣首笔房款，不重复计入购房总支出。下方收益指标已注明各自分母，不能直接混用。</p></details>
      <GrowthScenarios price={result.price} totalCost={result.totalCost} noi={result.noi} exchangeRate={exchangeRate} />
      <footer><p>用于初步比较，不构成税务、法律、贷款或投资建议。复杂交易请由英国律师、税务师及贷款顾问复核。</p><a href="https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances" target="_blank" rel="noreferrer">HMRC 税率来源</a></footer>
    </div>
    <section className="print-report">
      <section className="overview-cover">
        <div className="overview-title"><div><p>UK PROPERTY PLANNER</p><h2>购房资金与收益分解表</h2><span>Cost Breakdown & Rental Return</span></div><div><b>{project || '未命名项目'}</b><span>{unit || '未填写房号'}</span><span>{new Date().toLocaleDateString('zh-CN')}</span></div></div>
        <div className="overview-caption">测算汇率：1 GBP = {exchangeRate.toFixed(3)} CNY <span>金额按显示精度四舍五入 · 完整明细见后页</span></div>
        <CostOverview groups={overviewGroups} exchangeRate={exchangeRate} />
        <div className="overview-caveats"><b>{paymentOk && loanOk && fundingOk ? '付款计划核对通过' : '注意：付款计划存在不一致，请先核对后页警示'}</b><p>预定金已在首笔房款中抵扣；各期金额和贷款抵扣详见付款明细。人民币为按上述汇率换算的参考值。</p><p>当前年度运营成本仅含物业费、地租和租赁管理费，未另计空置、维修、保险、市政税、所得税及出售成本。净经营收益不等于税后利润；现金流中的偿债可能包含归还本金。</p><p>本报告为假设条件下的估算，不构成税务、法律、贷款或投资建议，亦不代表保证收益。</p></div>
      </section>
      <div className="print-report-head"><div><p>UK PROPERTY PLANNER · FULL CALCULATION</p><h2>英国买房完整测算报告</h2></div><span>生成日期：{new Date().toLocaleDateString('zh-CN')}</span></div>
      <div className="print-property"><div><p>测算项目</p><h3>{project || '未命名项目'} · {unit || '未填写房号'}</h3></div><div className="print-property-total"><span>购房总成本</span><b>{currency.format(result.totalCost)}</b><small>{cny.format(result.totalCost * exchangeRate)}</small></div></div>

      <div className="print-section"><h4>01 · 房产与买家信息</h4><table className="print-data-table compact"><tbody>
        <tr><th>项目名称</th><td>{project || '—'}</td><th>房号</th><td>{unit || '—'}</td></tr>
        <tr><th>室内面积</th><td>{area.toLocaleString()} ft²</td><th>英镑兑人民币</th><td>1 GBP = {exchangeRate.toFixed(3)} CNY</td></tr>
        <tr><th>房屋原价</th><td>{currency.format(originalPrice)}</td><th>折扣率</th><td>{discount.toFixed(2)}%</td></tr>
        <tr><th>折后房价</th><td>{currency.format(result.price)}</td><th>人民币参考</th><td>{cny.format(result.price * exchangeRate)}</td></tr>
        <tr><th>UK Resident</th><td>{resident ? '是' : '否'}</td><th>购房性质</th><td>{purchaseTypeLabel}</td></tr>
      </tbody></table></div>

      <div className="print-section"><h4>02 · 购房成本明细</h4><table className="print-data-table amounts"><thead><tr><th>项目</th><th>计算口径</th><th>英镑金额</th><th>人民币参考</th></tr></thead><tbody>
        <tr><td>房款</td><td>原价 ×（1 − 折扣率）</td><td>{currency.format(result.price)}</td><td>{cny.format(result.price * exchangeRate)}</td></tr>
        <tr><td>印花税 SDLT</td><td>按买家身份及购房性质计算</td><td>{currency.format(result.sdlt)}</td><td>{cny.format(result.sdlt * exchangeRate)}</td></tr>
        <tr><td>律师费及 VAT</td><td>用户输入</td><td>{currency.format(legalFee)}</td><td>{cny.format(legalFee * exchangeRate)}</td></tr>
        <tr><td>其他购房杂费</td><td>用户输入</td><td>{currency.format(otherFee)}</td><td>{cny.format(otherFee * exchangeRate)}</td></tr>
        <tr><td>土地注册费</td><td>用户输入</td><td>{currency.format(registryFee)}</td><td>{cny.format(registryFee * exchangeRate)}</td></tr>
        <tr className="subtotal"><td>其他款项合计</td><td>印花税 + 律师费 + 杂费 + 注册费</td><td>{currency.format(result.totalCost - result.price)}</td><td>{cny.format((result.totalCost - result.price) * exchangeRate)}</td></tr>
        <tr className="grand-total"><td>购房总成本</td><td>房款 + 其他款项合计</td><td>{currency.format(result.totalCost)}</td><td>{cny.format(result.totalCost * exchangeRate)}</td></tr>
      </tbody></table></div>

      <div className="print-section"><h4>03 · 贷款与资金安排</h4><table className="print-data-table compact"><tbody>
        <tr><th>贷款比例</th><td>{loanRatio.toFixed(2)}%</td><th>贷款金额</th><td>{currency.format(result.loan)}</td></tr>
        <tr><th>贷款利率</th><td>{interestRate.toFixed(2)}%</td><th>贷款年限</th><td>{loanYears} 年</td></tr>
        <tr><th>还款方式</th><td>{repaymentTypeLabel}</td><th>预计月供</th><td>{currency.format(result.monthlyMortgage)}</td></tr>
        <tr><th>年度偿债</th><td>{currency.format(result.annualDebt)}</td><th>需投入现金</th><td>{currency.format(result.cashNeeded)}</td></tr>
        <tr><th>人民币贷款参考</th><td>{cny.format(result.loan * exchangeRate)}</td><th>人民币现金参考</th><td>{cny.format(result.cashNeeded * exchangeRate)}</td></tr>
      </tbody></table></div>

      <div className="print-section"><h4>04 · 持有成本与租赁假设</h4><table className="print-data-table amounts"><thead><tr><th>项目</th><th>输入 / 计算口径</th><th>月度金额</th><th>年度金额</th></tr></thead><tbody>
        <tr><td>预计租金</td><td>用户输入</td><td>{currency.format(monthlyRent)}</td><td>{currency.format(result.annualRent)}</td></tr>
        <tr><td>物业费</td><td>{currency.format(serviceRate)} / ft² / 年 × {area.toLocaleString()} ft²</td><td>{currency.format(serviceCharge / 12)}</td><td>{currency.format(serviceCharge)}</td></tr>
        <tr><td>地租</td><td>用户输入</td><td>{currency.format(groundRent / 12)}</td><td>{currency.format(groundRent)}</td></tr>
        <tr><td>租赁管理费</td><td>年租金 × {managementRate.toFixed(2)}%</td><td>{currency.format(managementFee / 12)}</td><td>{currency.format(managementFee)}</td></tr>
        <tr className="subtotal"><td>运营成本合计</td><td>物业费 + 地租 + 租赁管理费</td><td>{currency.format(operatingCosts / 12)}</td><td>{currency.format(operatingCosts)}</td></tr>
        <tr className="grand-total"><td>净经营收益 NOI</td><td>年度租金 − 运营成本</td><td>{currency.format(result.noi / 12)}</td><td>{currency.format(result.noi)}</td></tr>
      </tbody></table></div>

      <div className="print-section"><h4>05 · 收益与现金流指标</h4><table className="print-data-table compact"><tbody>
        <tr><th>租金毛回报率</th><td>{percent.format(result.grossYield)}</td><th>租金净回报率</th><td>{percent.format(result.netYield)}</td></tr>
        <tr><th>年度租金收入</th><td>{currency.format(result.annualRent)}</td><th>年度运营成本</th><td>{currency.format(operatingCosts)}</td></tr>
        <tr><th>净经营收益 NOI</th><td>{currency.format(result.noi)}</td><th>年度偿债</th><td>{currency.format(result.annualDebt)}</td></tr>
        <tr><th>税前年净现金流</th><td className={result.netCash >= 0 ? 'value-positive' : 'value-negative'}>{currency.format(result.netCash)}</td><th>现金回报率</th><td>{percent.format(result.cashReturn)}</td></tr>
      </tbody></table></div>

      <div className="print-section print-page-break"><h4>06 · 付款计划明细</h4><table className="print-data-table amounts"><thead><tr><th>付款阶段</th><th>比例</th><th>应付房款</th><th>贷款抵扣</th><th>现金支付</th><th>人民币参考</th></tr></thead><tbody>
        <tr><td>预定金</td><td>—</td><td>—</td><td>—</td><td>{currency.format(deposit)}</td><td>{cny.format(deposit * exchangeRate)}</td></tr>
        {paymentDetails.map((item, index) => <tr key={index}><td>{item.label}</td><td>{item.ratio.toFixed(2)}%</td><td>{currency.format(item.due)}</td><td>{item.loanApplied ? currency.format(item.loanApplied) : '—'}</td><td>{currency.format(item.cash)}</td><td>{cny.format(item.cash * exchangeRate)}</td></tr>)}
        <tr className="grand-total"><td>合计</td><td>{paymentTotal.toFixed(2)}%</td><td>{currency.format(result.price)}</td><td>{currency.format(result.loan)}</td><td>{currency.format(paymentCashTotal)}</td><td>{cny.format(paymentCashTotal * exchangeRate)}</td></tr>
      </tbody></table></div>

      <div className="print-section"><h4>07 · 核对结果</h4><div className="print-checks">
        <div className={paymentOk ? 'ok' : 'bad'}><b>{paymentOk ? '✓' : '!'}</b><span>付款比例合计</span><strong>{paymentTotal.toFixed(2)}%</strong><small>{paymentOk ? '比例合计正确' : '应调整至 100%'}</small></div>
        <div className={loanOk ? 'ok' : 'bad'}><b>{loanOk ? '✓' : '!'}</b><span>尾款贷款抵扣</span><strong>{currency.format(finalPayment)}</strong><small>{loanOk ? '贷款可在尾款中抵扣' : '贷款金额超过尾款'}</small></div>
        <div className={fundingOk ? 'ok' : 'bad'}><b>{fundingOk ? '✓' : '!'}</b><span>房款资金核对</span><strong>{currency.format(paymentCashTotal + result.loan)}</strong><small>{fundingOk ? '现金 + 贷款 = 房款' : '资金安排与房款不一致'}</small></div>
      </div></div>

      <GrowthScenarios price={result.price} totalCost={result.totalCost} noi={result.noi} exchangeRate={exchangeRate} />
      <div className="print-method"><h4>计算口径与说明</h4><p>人民币金额仅按本报告汇率换算，实际结算以银行或支付机构汇率为准。印花税按当前工具内置的英国住宅 SDLT 规则估算；特殊持有结构、公司购房、混合用途、非自然人或其他复杂交易可能适用不同规则。</p><p>本报告用于初步比较，不构成税务、法律、贷款或投资建议。所有税费、贷款条件、租金及持有成本请在交易前由英国律师、税务师、贷款顾问及物业管理方复核。</p><p className="print-source">税率参考：HMRC · 英国住宅印花税（工具口径更新基准：2025-04-01）</p></div>
    </section>
  </main>;
}
