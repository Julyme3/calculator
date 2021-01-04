import {Component, Prop, Vue} from 'vue-property-decorator';
import {VueComponent} from '../../shims-vue';
import { OperationType } from './types';

import styles from './index.css?module'

const CLASS_NAME = 'Calculator';

@Component
export default class Calculator extends VueComponent {
  private nums: Array<string> = Array.from({length: 10}, (_, i) => String(i));
  private timerId: number = 0;
  private opsSymbol: Array<string> = ['-', '+'];
  private buffer: string = '';
  private result: string = '0';
  private operations: Array<OperationType> = [
  //   {
  //   '*': function(a: number, b: number) {
  //     return a * b
  //   },
  //
  //   '/': function(a: number, b: number) {
  //     return a / b
  //   },
  // },
  {
    '+': (a, b) => a + b,

    '-': (a, b) => a - b
  }];
  private disabled: boolean = false;

  handleClickBtn(sym: string) {
    if (this.opsSymbol.indexOf(sym) !== -1) {
      this.buffer += ` ${sym} `;
      return;
    }
    this.buffer += `${sym}`;
  };


  parseString(str: string) {
    const chartArr = [];
    let current = '';

    for (let i = 0; i < str.length; i++) {
      const isOperator = this.opsSymbol.indexOf(str[i]) !== -1;

      if (isOperator) {
        if (current) {
          chartArr.push(current);
          current = '';
        }
        chartArr.push(str[i]);
      } else {
        current += str.charAt(i);
      }
    }

    if (current) {
      chartArr.push(current);
    }

    return chartArr;
  }

  calculate(chartArr: Array<string | number>) {
    let currentCalc: Array<string | number> = [];
    let resCalc = [...chartArr];

    this.operations.forEach((op: OperationType) => {
      let calculateCurrentOper: ((a: number, b: number) => number) | null = null;

      for (let i = 0; i < resCalc.length; i++) {
        const operation = op[resCalc[i]];

        if (operation) {
          calculateCurrentOper = operation;
        } else if (calculateCurrentOper) {
          let lastEl = currentCalc[currentCalc.length - 1] || 0;
          if (currentCalc.length) {
            currentCalc[currentCalc.length - 1] = calculateCurrentOper(Number(lastEl), Number(resCalc[i]))
          } else {
            currentCalc.push(`${resCalc[i - 1]}${resCalc[i]}`);
          }
          calculateCurrentOper = null;
        } else {
          currentCalc.push(resCalc[i])
        }
      }

      resCalc = currentCalc;
      currentCalc = [];
    });

    this.result = resCalc.join('');
  }

  handleClickReset() {
    this.buffer = '';
    this.result = '0';
  }

  handleClickEquale() {
    this.disabled = true;
    this.timerId = setTimeout(() => {
      this.calculate(this.parseString(this.buffer));
      this.disabled = false;
    }, 1000);
  }

  beforeDestroy() {
    clearTimeout(this.timerId);
  }

  render() {

    return (
      <div class={styles[CLASS_NAME]}>
        <div class={styles[`${CLASS_NAME}__input-wrap`]}>
          <div class={styles[`${CLASS_NAME}__input`]}>{this.buffer}</div>
          <div class={styles[`${CLASS_NAME}__result`]}>= {this.result}</div>
        </div>
        <div class={styles[`${CLASS_NAME}__bottom-wrap`]}>
          <div class={styles[`${CLASS_NAME}__numbersWrap`]}>
            {this.nums.map(num => (
              <button
                class={styles[`${CLASS_NAME}__number`]}
                onclick={() => this.handleClickBtn(num)}
                disabled={this.disabled}
              >{num}</button>
            )).reverse()}
          </div>

          <div class={styles[`${CLASS_NAME}__operationsWrap`]}>
            <button
              class={styles[`${CLASS_NAME}__operations`]}
              onclick={this.handleClickReset}
            >C</button>
            {this.opsSymbol.map((op) => (
              <button
                class={styles[`${CLASS_NAME}__operations`]}
                onclick={() => this.handleClickBtn(op)}
              >{op}</button>
            ))}
            <button
              class={styles[`${CLASS_NAME}__operations`]}
              onClick={this.handleClickEquale}
              disabled={this.disabled}
            >=</button>
          </div>
        </div>

      </div>
    )
  }
}
