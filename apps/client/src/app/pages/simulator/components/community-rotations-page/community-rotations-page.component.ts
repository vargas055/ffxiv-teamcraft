import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { RotationTag } from './rotation-tag';
import { CraftingRotationService } from '../../../../core/database/crafting-rotation/crafting-rotation.service';
import { Tables } from '../../model/tables';
import { CommunityRotationFilters } from '../../../../core/database/crafting-rotation/community-rotation-filters';

@Component({
  selector: 'app-community-rotations-page',
  templateUrl: './community-rotations-page.component.html',
  styleUrls: ['./community-rotations-page.component.less']
})
export class CommunityRotationsPageComponent {

  public tags: any[];

  private filters$: Observable<CommunityRotationFilters>;

  public tagsFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public nameFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public rlvlFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public durabilityFilter$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 20;

  public totalLength = 0;

  loading = true;

  filteredRotations$: Observable<CraftingRotation[]>;

  public rlvls = [
    ...Object.keys(Tables.LEVEL_TABLE)
      .map(level => {
        return {
          label: level,
          value: +Tables.LEVEL_TABLE[level]
        };
      }),

    {
      label: '1 - 10',
      value: 10
    },
    {
      label: '11 - 20',
      value: 20
    },
    {
      label: '21 - 30',
      value: 30
    },
    {
      label: '31 - 40',
      value: 40
    },
    {
      label: '41 - 50',
      value: 50
    },

    // 50 stars
    {
      label: '50 ★',
      value: 55
    },
    {
      label: '50 ★★',
      value: 70
    },
    {
      label: '50 ★★★',
      value: 90
    },
    {
      label: '50 ★★★★',
      value: 110
    },

    // 60 stars
    {
      label: '60 ★',
      value: 160
    },
    {
      label: '60 ★★',
      value: 180
    },
    {
      label: '60 ★★★',
      value: 220
    },
    {
      label: '60 ★★★★',
      value: 250
    },

    // 70 stars
    {
      label: '70 ★',
      value: 300
    },
    {
      label: '70 ★★',
      value: 320
    },
    {
      label: '70 ★★★',
      value: 350
    },
    {
      label: '70 ★★★★',
      value: 380
    }
  ].sort((a, b) => a.value - b.value);

  constructor(private rotationsFacade: RotationsFacade, private rotationsService: CraftingRotationService, route: ActivatedRoute, router: Router) {
    this.tags = Object.keys(RotationTag).map(key => {
      return {
        value: key,
        label: `SIMULATOR.COMMUNITY_ROTATIONS.TAGS.${key}`
      };
    });
    this.filters$ = combineLatest(this.nameFilter$, this.tagsFilter$, this.rlvlFilter$, this.durabilityFilter$).pipe(
      tap(([name, tags, rlvl, durability]) => {
        this.page$.next(1);
        const queryParams = {};
        if (name !== '') {
          queryParams['name'] = name;
        }
        if (tags.length > 0) {
          queryParams['tags'] = tags.join(',');
        }
        if (rlvl !== null) {
          queryParams['rlvl'] = rlvl;
        }
        if (durability !== null) {
          queryParams['durability'] = durability;
        }
        router.navigate([], {
          queryParams: queryParams,
          relativeTo: route
        });
      }),
      map(([name, tags, rlvl, durability]) => {
        return { name: name, tags: tags, rlvl: rlvl, durability: durability };
      })
    );
    route.queryParamMap
      .pipe(first())
      .subscribe((query) => {
        this.nameFilter$.next(query.get('name') || '');
        if (query.get('tags') !== null) {
          this.tagsFilter$.next(query.get('tags').split(',').filter(tag => tag !== ''));
        }
        if (query.get('rlvl') !== null) {
          this.rlvlFilter$.next(+query.get('rlvl'));
        }
        if (query.get('durability') !== null) {
          this.durabilityFilter$.next(+query.get('durability'));
        }
      });
    this.filteredRotations$ = this.filters$.pipe(
      tap(() => this.loading = true),
      debounceTime(250),
      switchMap((filters) => {
        return this.rotationsService.getCommunityRotations({
          ...filters,
          tags: filters.tags.map(tag => RotationTag[tag])
        }).pipe(
          tap(rotations => {
            this.totalLength = rotations.length;
          }),
          switchMap(rotations => {
            return this.page$.pipe(map(page => {
              const pageStart = Math.max(0, (page - 1) * this.pageSize);
              return rotations.slice(pageStart, pageStart + this.pageSize);
            }));
          })
        );
      }),
      tap(() => setTimeout(() => this.loading = false))
    );
  }

  resetFilters(): void {
    this.tagsFilter$.next([]);
    this.rlvlFilter$.next(null);
    this.durabilityFilter$.next(null);
  }

  trackByRotation(index: number, rotation: CraftingRotation): string {
    return rotation.$key;
  }

}
