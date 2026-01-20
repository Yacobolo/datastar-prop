import { LitElement, html, css, PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface ChartDataPoint {
  name: string
  value: number
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie'
  theme: 'dark' | 'light'
  showLegend: boolean
  animate: boolean
  color: string
}

/**
 * An ECharts wrapper component
 * Demonstrates deep reactivity with chart data arrays and config
 */
@customElement('data-chart')
export class DataChart extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 300px;
    }
    .chart {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-2, 8px);
    }
  `

  @property({ type: Array }) data: ChartDataPoint[] = []
  @property({ type: Object }) config: ChartConfig = {
    type: 'bar',
    theme: 'dark',
    showLegend: true,
    animate: true,
    color: '#6366f1'
  }

  private chart: any = null
  private echartsModule: any = null
  private resizeObserver?: ResizeObserver

  protected async firstUpdated() {
    // Dynamic import of echarts from the importmap
    // @ts-ignore - echarts loaded via CDN importmap
    this.echartsModule = await import('echarts')
    this.initChart()
  }

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('data') || changedProperties.has('config')) {
      this.updateChart()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.chart?.dispose()
    this.resizeObserver?.disconnect()
  }

  private initChart() {
    if (!this.echartsModule) return
    const container = this.shadowRoot?.querySelector('.chart') as HTMLElement
    if (!container) return

    this.chart = this.echartsModule.init(container, this.config.theme)
    this.updateChart()

    // Handle resize
    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize()
    })
    this.resizeObserver.observe(container)
  }

  private updateChart() {
    if (!this.chart || !this.echartsModule) return

    // Re-init if theme changed
    const container = this.shadowRoot?.querySelector('.chart') as HTMLElement
    if (container) {
      const currentTheme = this.config.theme
      this.chart.dispose()
      this.chart = this.echartsModule.init(container, currentTheme)
    }

    const option = this.getChartOption()
    this.chart.setOption(option, true)
  }

  private getChartOption(): any {
    const { type, showLegend, animate, color } = this.config
    const names = this.data.map(d => d.name)
    const values = this.data.map(d => d.value)

    const baseOption: any = {
      animation: animate,
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: showLegend ? '15%' : '10%',
        containLabel: true
      },
      legend: {
        show: showLegend,
        top: 10,
        textStyle: {
          color: this.config.theme === 'dark' ? '#fff' : '#333'
        }
      }
    }

    if (type === 'pie') {
      return {
        ...baseOption,
        series: [{
          name: 'Data',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: this.config.theme === 'dark' ? '#1a1a2e' : '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: this.config.theme === 'dark' ? '#fff' : '#333'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: this.data.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: {
              color: this.getColor(i)
            }
          }))
        }]
      }
    }

    // Bar or Line chart
    const echarts = this.echartsModule
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          color: this.config.theme === 'dark' ? '#888' : '#666'
        },
        axisLine: {
          lineStyle: {
            color: this.config.theme === 'dark' ? '#333' : '#ccc'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: this.config.theme === 'dark' ? '#888' : '#666'
        },
        splitLine: {
          lineStyle: {
            color: this.config.theme === 'dark' ? '#333' : '#eee'
          }
        }
      },
      series: [{
        name: 'Value',
        type: type,
        data: values,
        smooth: type === 'line',
        areaStyle: type === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '80' },
            { offset: 1, color: color + '10' }
          ])
        } : undefined,
        itemStyle: {
          color: color,
          borderRadius: type === 'bar' ? [4, 4, 0, 0] : 0
        },
        lineStyle: type === 'line' ? {
          width: 3,
          color: color
        } : undefined
      }]
    }
  }

  private getColor(index: number): string {
    const colors = [
      this.config.color,
      '#a855f7',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#3b82f6'
    ]
    return colors[index % colors.length]
  }

  render() {
    return html`<div class="chart"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-chart': DataChart
  }
}
