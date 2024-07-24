<template>
  <section>
    <form
      v-if="pairData.length > 0"
      class="flex-row flex-middle flex-stretch push-bottom"
      action="#"
      @submit.prevent="testFun"
    >
      <div class="form-input flex-1 push-right">
        <div class="icon-chart-line push-right"></div>
        <input
          class="push-right"
          placeholder="0.00000000"
          name="price"
          v-model="curPrice"
        />
        <input class="push-right" placeholder="0%" name="percent" />
      </div>
      <button type="submit" class="form-btn bg-success-hover icon-add iconLeft">
        Set All Alarms
      </button>
    </form>
  </section>
</template>

<script>
// component
export default {
  // component props
  props: {
    alarmsData: {
      type: Array,
      default() {
        return [];
      },
      required: true,
    },
    pairData: {
      type: Array,
      default() {
        return [];
      },
    },
  },

  // comonent data
  data() {
    return {
      curPrice: "",
    };
  },

  // computed methods
  computed: {
    // filter alarms for this token
    alarmsList() {
      let list = this.alarmsData.slice();
      let symbol = this.pairData.symbol || "";

      // sort all alarms by symbol
      list = this.$utils.sort(list, "symbol", "asc");

      // sort alarms for a specific symbol by status
      if (symbol) {
        list = list.filter((a) => a.symbol === symbol);
        list = this.$utils.sort(list, "active", "desc");
      }
      // update count outside
      this.$emit("listCount", list.length);
      return list;
    },
  },

  // component methods
  methods: {
    // save a new alert for this token
    saveAlarm(e) {
      this.pairData.map((item) => {
        let { symbol, asset, close } = item;
        let price = item.close
          ? parseFloat((price * e.target.percent.value) / 100) +
            parseFloat(price)
          : parseFloat(price) || 0;
        let saved = this.$alarms.add(this.pairData, price);
        if (!saved)
          return this.$bus.emit(
            "showNotice",
            "Please enter a different " + asset + " alarm price.",
            "warning"
          );
        this.$bus.emit(
          "showNotice",
          "New alarm for " +
            symbol +
            " set for " +
            price.toFixed(8) +
            " " +
            asset +
            ".",
          "success"
        );
      });
    },

    async testFun(e) {
      const alarms = [];
      const percent = parseFloat(e.target.percent.value);

      this.pairData.forEach((item) => {
        let symbol = item.symbol;
        let asset = item.asset;
        let close = item.close;
        let price = percent
          ? parseFloat((item.close * percent) / 100) + parseFloat(item.close)
          : parseFloat(item.close) || 0;

        let saved = this.$alarms.add(item, price);
        if (!saved) {
          this.$bus.emit(
            "showNotice",
            "Please enter a different " + asset + " alarm price.",
            "warning"
          );
          return;
        }

        this.$bus.emit(
          "showNotice",
          "New alarm for " +
            symbol +
            " set for " +
            price.toFixed(8) +
            " " +
            asset +
            ".",
          "success"
        );

        alarms.push({ symbol: symbol, threshold: price, percent: percent });
      });

      console.log("Alarms setted");

      try {
        await fetch(
          "https://binance-alerts-backend-production.up.railway.app/set-alarms",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ alarms }),
          }
        );
        console.log("Alarms set successfully");
      } catch (error) {
        console.error("Error setting alarms:", error);
      }
    },

    // toggle existing alarm for as symbol by id
    toggleAlarm(id, symbol, toggle) {
      let action = toggle ? "enabled" : "disabled";
      this.$alarms.toggle(id, toggle);
      this.$bus.emit(
        "showNotice",
        "Alarm for " + symbol + " has been " + action + ".",
        "success"
      );
    },

    // remove an alert from the list by id
    deleteAlarm(id, symbol) {
      this.$alarms.remove(id);
      this.$bus.emit(
        "showNotice",
        "Alarm for " + symbol + " has been removed.",
        "success"
      );
    },

    // flush all alarms from the list
    async flushAlarms() {
      if (!confirm("Delete all alarms from the list?")) return;

      // Clear alarms in the frontend
      this.$alarms.flush();
      this.$bus.emit("showNotice", "All alarms have been deleted.", "success");

      // Clear alarms in the backend
      try {
        const response = await fetch(
          "https://binance-alerts-backend-production.up.railway.app/clear-alarms",
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to clear alarms on the backend");
        }

        console.log("Alarms cleared on the backend");
        this.$bus.emit(
          "showNotice",
          "All alarms have been cleared on the backend.",
          "success"
        );
      } catch (error) {
        console.error("Error clearing alarms on the backend:", error);
        this.$bus.emit(
          "showNotice",
          "Error clearing alarms on the backend.",
          "error"
        );
      }
    },
  },

  // component mounted
  mounted() {
    if (this.pairData.symbol) {
      this.curPrice = Number(this.pairData.close).toFixed(8);
    }
  },
};
</script>

