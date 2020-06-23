<template>
        <ul>
            <li v-for="(pos, j) in data.current_positions" :key="j">
                <span class="position-name">{{pos.technician_position_name_en}} </span> -
                <span class="lab-name">{{pos.technician_office_name_en}} @ </span>
                <span :class="pos.unit_short_name + ' unit'">{{pos.unit_short_name}}</span>
                <br>
                <span class="date-affiliation">
                    Dedication: {{pos.dedication}}%
                    ({{pos.valid_from}} - {{pos.valid_until}})
                </span>
            </li>
        </ul>
</template>
<script>
import subUtil from '@/components/common/submit-utils'
import time from '@/components/common/date-utils'

export default {
    props: {
        otherPersonId: Number,
    },
    data () {
        return {
            data: {
                current_positions: [],
                past_positions: [],
            },
        }
    },
    created () {
        this.initialize();
    },
    watch: {
        otherPersonId () {
            this.initialize();
        },
    },
    methods: {
        initialize () {
            this.data.current_positions = [];
            this.data.past_positions = [];
            if (this.$store.state.session.loggedIn) {
                let personID = this.otherPersonId;
                subUtil.getInfoPopulate(this, 'api/people/' + personID + '/technical-affiliations', true)
                .then( (result) => {
                    for (let el in result) {
                        this.data.current_positions.push({});
                        Object.keys(result[el]).forEach(key => {
                            let value = result[el][key];
                            if (key === 'valid_from' || key === 'valid_until') {
                                value = time.momentToDate(value);
                            }
                            this.data.current_positions[el][key] = value;
                        });
                    }
                    this.data.current_positions = time.sorter(this.data.current_positions,'valid_from');
                })
            }
        },
    },
}
</script>

<style scoped>

li {
    margin-top: 20px;
}

.position-name {
    font-weight:bold;
    color:#000000;
}

.lab-name {
    color:#777777;
}

.date-affiliation {
    font-size: 0.8rem;
}

.UCIBIO {
    color: blue;
}

.LAQV {
    color: green;
}
.unit {
    font-weight: 300;
}

</style>