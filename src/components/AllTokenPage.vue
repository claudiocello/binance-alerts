<template>
  <section :class="modalData.style">

    <!-- events and alarms -->
    <!-- <Tabs class="tokenpage-tabs" :data="{ alarmsCount, newsCount }">
      <section btn-class="icon-alarm iconLeft" :btn-name="[ 'Alarms ('+ alarmsCount +')' ]" active>
        <AlarmsList :alarmsData="alarmsData" :pairData="modalData" @listCount="onAlarmsCount"></AlarmsList>
      </section>
      <section btn-class="icon-calendar iconLeft" :btn-name="[ 'News ('+ newsCount +')' ]">
        <NewsList :newsEntries="newsEntries" :pairData="modalData" @listCount="onNewsCount"></NewsList>
      </section>
    </Tabs> -->

    <AlarmsListAll :alarmsData="alarmsData" :pairData="modalData" @listCount="onAlarmsCount"></AlarmsListAll>

  </section>
</template>

<script>
import Spinner from './Spinner.vue';
import Tabs from './Tabs.vue';
import TokenIcon from './TokenIcon.vue';
import LineChart from './LineChart.vue';
import AlarmsList from './AlarmsList.vue';
// import NewsList from './NewsList.vue';

// component
export default {

  // component list
  components: {
    Spinner,
    Tabs,
    TokenIcon,
    LineChart,
    AlarmsList,
    // NewsList,
  },

  // component props
  props: {
    //modalData: { type: Array, default() { return [] }, required: true }, // pair data
    priceData: { type: Array, default() { return [] }, required: true },
    alarmsData: { type: Array, default() { return [] } },
    newsEntries: { type: Array, default() { return [] } },
  },

  // comonent data
  data() {
    return {
      alarmsCount: 0,
      newsCount: 0,
      // line chart
      chartWidth: 800,
      chartHeight: 120,
      chartData: [],
    }
  },

  // watch methods
  watch: {

    // update title as token data changes

  },

  computed: {
    modalData() {
      let { market } = 'USDT';

      let limit  = parseInt( this.options.prices.limit ) | 0;
      let search = String( this.searchStr ).replace( /[^A-Z0-9]+/gi, '' );
      let regex  = ( search.length > 1 ) ? new RegExp( search, 'i' ) : null;
      let count  = this.priceData.length;
      let list   = [];

      // filter the list
      while ( count-- ) {
        let p = this.priceData[ count ];
        if ( market && p.market !== market ) continue;
        if ( regex && !( regex.test( p.token ) || regex.test( p.name ) ) ) continue;
        list.push( p );
      }
      // sort the list

      // update paging totals
      let total = list.length;
      this.listLeft = 0;

      // trim the list
      if ( total && limit && limit < total ) {
        list = list.slice( 0, limit );
        this.listLeft = ( total - list.length );
      }
      console.log("LIST", list)
      return list;
    }
  },

  // component methods
  methods: {

    // lick to binance site with ref id added
    tradeLink() {
      let { token, market } = this.modalData;
      this.$bus.emit( 'handleClick', 'binance', '/en/trade/'+ token +'_'+ market +'/', '_blank' );
    },

    // update alarms count for this token
    onAlarmsCount( count ) {
      this.alarmsCount = count;
    },

    // update events count for this token
    onNewsCount( count ) {
      this.newsCount = count;
    },

    // spinner helper
    spinner( name, method, message ) {
      if ( !this.$refs[ name ] || !method ) return;
      this.$refs[ name ][ method ]( message );
    },

    // fetch token data from api
    fetchGlobalData() {
      this.$coincap.fetchCoin( this.modalData.id, data => {
        let { rank, marketCapUsd, supply, volumeUsd24Hr, priceUsd } = data;
      });
    },

    // fetch last 24h candle data

  },

  // component mounted
  mounted() {
    this.fetchGlobalData();
  },
}
</script>

